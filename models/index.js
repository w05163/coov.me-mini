/**
 * model主文件
 */
const regeneratorRuntime = require('../libs/regenerator-runtime');
const { createStore, applyMiddleware } = require('../libs/redux');
const sage = require('../libs/redux-saga');
const { isEqual, setData } = require('../utils/util');
const { default: createSagaMiddleware, effects } = sage;
const { put, takeEvery } = effects;

const initialState = {};
const modelReducers = {};
const modelEffects = {};
const modelOther = {};

function modelInit(state = initialState, action) {
	if (action.type === 'modelInit') {
		return {
			...state,
			[action.model]: action.state
		};
	}
	for (const key in modelReducers) {
		const model = modelReducers[key];
		for (const k in model) {
			const type = `${key}/${k}`;
			if (action.type === type) {
				return { ...state, [key]: model[k](state[key], action, key, modelOther[key]) };
			}
		}
	}
	return state;
}

const sagaMiddleware = createSagaMiddleware();
const store = createStore(modelInit, applyMiddleware(sagaMiddleware));
setData('dispatch', store.dispatch);


function makeEffectFun(namespace, proxyPut) {
	return function *(action) {
		const { type } = action;
		const key = type.replace(`${namespace}/`, '');
		const effects = modelEffects[namespace];
		const effect = effects[key];
		if (!effect) return;
		yield* effect(action, { put: proxyPut }, namespace, modelOther[namespace]);
	};
}

// 生成代理put或者dispatch方法，会自动在type前面加上"namespace\"
function makeProxy(namespace, fun) {
	return function ({ type, ...action }) {
		type = type.includes('/') ? type : `${namespace}/${type}`;
		return fun({ ...action, type });
	};
}

function runModel(model) {
	const {
		namespace, state = {}, effects = {}, reducers = {}, subscriptions = {},
		...other
	} = model;

	initialState[namespace] = state;
	modelReducers[namespace] = reducers;
	modelEffects[namespace] = effects;
	modelOther[namespace] = other;
	const proxyPut = makeProxy(namespace, put);
	const proxyDispatch = makeProxy(namespace, store.dispatch);
	const effect = makeEffectFun(namespace, proxyPut);

	for (const k in effects) {
		sagaMiddleware.run(function *() {
			yield takeEvery(`${namespace}/${k}`, function *(...args) {
				try {
					yield effect(...args);
				} catch (error) {
					console.error('model未捕捉的错误', error);
				}
			});
		});
	}

	store.dispatch({ type: 'modelInit', model: namespace, state });

	Promise.resolve().then(() => {
		for (const k in subscriptions) {
			subscriptions[k]({ dispatch: proxyDispatch, state });
		}
	});
}

const defaultMapStateToProps = () => ({}); // eslint-disable-line no-unused-vars

function connect(mapStateToProps, isComponent) {
  const shouldSubscribe = Boolean(mapStateToProps);
  const mapState = mapStateToProps || defaultMapStateToProps;

  return function wrapWithConnect(pageConfig) {
    function handleChange(options) {
      if (!this.unsubscribe) return;

      const state = store.getState();
			const props = mapState(state, options);
      if (!isEqual(this.data.props, props)) {
				if (typeof this.componentWillReceiveProps === 'function') {
					try {
						this.componentWillReceiveProps(props);
					} catch (error) {
						console.error(error);
					}
				}
				this.props = {
					...props,
					dispatch: store.dispatch
				};
				this.setData({ props });
      }
		}

		const onLoad = isComponent ? pageConfig.created : pageConfig.onLoad;
		const onUnload = isComponent ? pageConfig.detached : pageConfig.onUnload;

    return {
			...pageConfig,
			onLoad(options) {
				if (shouldSubscribe) {
					this.unsubscribe = store.subscribe(handleChange.bind(this, options));
					handleChange.call(this, options);
				}
				if (typeof onLoad === 'function') {
					onLoad.call(this, options);
				}
			},
			onUnload() {
				if (typeof onUnload === 'function') {
					onUnload.call(this);
				}
				typeof this.unsubscribe === 'function' && this.unsubscribe();
			}
		};
  };
}

// 运行model
// runModel(app);

module.exports = {
	store,
	runModel,
	connect
};
