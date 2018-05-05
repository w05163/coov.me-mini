const _ = require('../utils/util');
const initState = {};

/**
 * 基本的model
 * 默认有一个list，并对list进行增删改
 * 提供extend用于model继承
 */
const baseModal = {
	namespace: 'base',
	state: {
		list: []
	},
	subscriptions: {
		setup({ dispatch }) {
			dispatch({ type: 'init' });
		}
	},
	effects: {},
	reducers: {
		add(state, { data }) {
			return { ...state, list: state.list.concat(data) };
		},
		remove(state, { id, ids }) {
			ids = ids || [id];
			return {
				...state,
				list: state.list.filter(i => !ids.includes(i.id))
			};
		},
		update(state, { data }) {
			return {
				...state,
				list: state.list.map(i => i.id === data.id ? { ...i, ...data } : i)
			};
		},
		set(state, { type, ...other }) {
			return { ...state, ...other };
		},
		reset(state, action, namespace, { resetIgnoreKey = [] }) {
			const keep = {};
			resetIgnoreKey.forEach(k => keep[k] = state[k]);
			return {
				...initState[namespace],
				...keep
			};
		},
		setObj(state, { type, name, data }) {
			return { ...state, [name]: { ...state[name], ...data } };
		}
	}
};

function mixing(base, model, key) {
	return { ...base[key], ...model[key] };
}

module.exports = function extend(model, base = baseModal) {
	const keys = ['state', 'subscriptions', 'effects', 'reducers'];
	const obj = { ...base, ...model };
	keys.forEach(k => obj[k] = mixing(base, model, k));
	initState[model.namespace] = _.cloneDeep(obj.state);
	return obj;
};
