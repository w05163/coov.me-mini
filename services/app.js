const makeApi = require('./index');

const api = {
	getOpenid: '/app/wx/getOpenid', // 使用code获取openid
	getWxMobile: '/app/wx/getPhoneNumber', // 提供加密信息给后端解密
	userInfo: '/app/user/get',
	userUpdate: '/app/user/update'
};

const services = makeApi(api);

module.exports = services;
