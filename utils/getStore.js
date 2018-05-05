/** 封装从store中取特定数据的方法 */
const _ = require('./util');

function getStore(...args) {
	return function (state) {
		return args.reduce((p, arg) => {
			if (typeof arg === 'function') {
				return { ...p, ...arg(state) };
			} else if (Array.isArray(arg)) {
				const keys = arg.concat();
				const name = keys.shift();
				const modal = state[name];
				const d = { ...p };
				keys.forEach(k => d[k] = _.get(modal, k));
				return d;
			} else if (typeof arg === 'object') {
				const d = { ...p };
				Object.keys(arg).forEach(k => d[k] = _.get(state, arg[k]));
				return d;
			} else if (typeof arg === 'string') {
				const data = arg[0] === '*' ? _.get(state, arg.slice(1)) : _.get(state, arg);
				return arg[0] === '*' ? { ...p, ...data } : { ...p, [arg.split(/[.[\]"']/).pop()]: data };
			} else {
				return p;
			}
		}, {});
	};
}

module.exports = {
	getStore
};
