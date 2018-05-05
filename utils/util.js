const config = require('../config');


const [setData, getData] = (function () {
	const obj = {};
	function setFun(key, data) {
		obj[key] = data;
	}

	function getFun(key) {
		return obj[key];
	}
	return [setFun, getFun];
}());

const formatNumber = n => {
	n = n.toString();
	return n[1] ? n : `0${n}`;
};

function request(url, opt) {
	console.log('请求：', url, opt.data);
	return new Promise((resolve, ret) => {
		wx.request({
			...opt,
			url,
			header: { ...opt.header, Authorization: getData('token'), Version: config.apiVersion },
			data: opt.body ? opt.body : {
				appKey: config.appKey,
				data: opt.data,
				version: config.apiVersion
			},
			success: res => {
				console.log('返回', res, new Date());
				if (checkStatus(res)) {
					resolve(res.data);
				} else {
					ret(res);
				}
			},
			fail: ret
		});
	});
}

function checkStatus(res) {
	return res.statusCode === 200;
}

function timeToDes(time) {
	time = parseFloat(time);
	if (!time || isNaN(time)) return [0, 0, 0];
	const des = [];
	const m = 60 * 1000;
	const h = 60 * m;
	const d = 24 * h;
	des.push(Math.floor(time / d));
	time = time % d;
	des.push(Math.floor(time / h));
	time = time % h;
	des.push(Math.floor(time / m));
	return des;
}

function timeToDateString(time) {
	const d = new Date(time);
	return `${d.getFullYear()}-${formatNumber(d.getMonth() + 1)}-${formatNumber(d.getDate())} ${formatNumber(d.getHours())}:${toTwo(d.getMinutes())}:${toTwo(d.getSeconds())}`;
}

function isEqual(obj1 = {}, obj2 = {}) {
	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);
	if (keys1.length !== keys2.length) return false;
	for (let i = 0; i < keys1.length; i++) {
		const k = keys1[i];
		if (obj1[k] !== obj2[k]) return false;
	}
	return true;
}

function get(obj, path, defaultValue) {
	const paths = path.split(/[.[\]"']/).filter(s => s);
	let tem = obj;
	for (const s of paths) {
		if (tem === undefined || tem === null) return defaultValue;
		tem = tem[s];
	}
	return typeof tem === 'undefined' ? defaultValue : tem;
}

function cloneDeep(obj) {
	if (typeof obj === 'object') {
		const res = { ...obj };
		for (const k in obj) {
			if (typeof obj[k] === 'function') continue;
			res[k] = cloneDeep(obj[k]);
		}
		return res;
	} else {
		return obj;
	}
}

function wait(time = 1000) {
	return new Promise((res) => {
		setTimeout(() => res(time), time);
	});
}

/**
 * 控制请求参数，同一参数不会发送多次请求
 * @param {*} fun
 */
export function paramsControl(fun) {
	const paramsMap = new Map();
	return (params = {}) => {
		const key = JSON.stringify(params);
		let promise = paramsMap.get(key);
		if (!promise) {
			promise = fun(params).then(res => { // 请求返回则删除
				paramsMap.delete(key);
				return res;
			});
			paramsMap.set(key, promise);
		}
		return promise;
	};
}

function getOrderListParams(current = 0, size = 10, openid = getData('openid')) {
	return {
		asc: false,
		current,
		orderByField: 'ctime',
		query: {
			openId: openid
		},
		size
	};
}

function rad(d) {
	return d * Math.PI / 180.0;
}
function getDistance(lat1, lng1, lat2, lng2) {
	if ((Math.abs(lat1) > 90) || (Math.abs(lat2) > 90)) {
		return 0;
	}
	if ((Math.abs(lng1) > 180) || (Math.abs(lng2) > 180)) {
		return 0;
	}
	const radLat1 = rad(lat1);
	const radLat2 = rad(lat2);
	const a = radLat1 - radLat2;
	const b = rad(lng1) - rad(lng2);
	const s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
	Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
	return (s * 6378.137).toFixed(1);
}

module.exports = {
	request, checkStatus,
	timeToDes, timeToDateString, isEqual, get,
	cloneDeep, wait, paramsControl, setData, getData, getOrderListParams,
	getDistance
};
