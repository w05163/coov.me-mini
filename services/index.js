/** 构造函数 */
const config = require('../config');
const { request, paramsControl, cloneDeep, getData } = require('../utils/util');

function checkCode(res) {
	return res.code === '200';
}

/**
 * 传入{key:url}结构的对象，构造一个service，替代原本的大量重复代码
 * 会改变传入的json路径对象，给里面每一项添加前缀
 * @param {Object} paths
 * @returns {Object}
 */
function makeApi(paths) {
	const obj = {};
	const reg = /\/:[a-zA-Z0-9]*/g;
	const complete = /^(http:\/\/|https:\/\/).+$/;
	for (const k in paths) {
		let conf = paths[k];
		let path = '';
		if (typeof conf === 'object') {
			path = conf.url;
		} else {
			path = conf;
			conf = null;
		}
		if (!complete.test(path)) path = `${config.apiRoot}${path}`; // 如果不是完整的路径添加前缀
		obj[k] = paramsControl((params) => {
			const m = path.match(reg) || [];
			if (typeof params !== 'object' && m.length) {
				params = { [m[0].slice(1)]: params };
			}
			const body = cloneDeep(params);
			const url = m.reduce((p, n) => { // 替换掉路径中类似“:/id”等子串，替换成对应的参数
				const name = n.slice(1);
				const key = name.slice(1);
				delete body[key];
				return p.replace(name, encodeURIComponent(params[key]));
			}, path);
			const opt = {
				method: 'post',
				data: body,
				...conf
			};
			if (conf && conf.isBody) {
				delete opt.data;
				opt.body = params;
			}
			return request(url, opt).then(res => {
				if (checkCode(res)) return res.data;
				else if (res.code === '505') {
					getData('dispatch')({ type: 'app/login' });
				}
				wx.showModal({ title: '接口错误', content: res.message });
				throw new Error(`接口错误：${res.message}`);
			});
		});
	}
	return obj;
}

module.exports = makeApi;
