const regeneratorRuntime = require('../libs/regenerator-runtime');
const { effects: { call, select, take } } = require('../libs/redux-saga');
const config = require('../config');
const appApi = require('../services/app');
const { callWxApi } = require('../services/wx');
const { setData, getData } = require('../utils/util');
const extend = require('./base');

module.exports = extend({
	namespace: 'app',
	state: {
		user: null
	},
	effects: {
		*init(action, { put }) {
			yield put({ type: 'login' });
		},
		*login(action, { put }) {
			const setting = yield call(callWxApi, 'getSetting');
			if (setting.authSetting['scope.userInfo'] === false) { // 已拒绝过授权
				const res = yield call(callWxApi, 'showModal', {
					title: config.name,
					content: '小程序需要您的用户信息权限以区分用户，请开启授权以供后续操作。',
					showCancel: true,
				});
				if (!res.confirm) return;
				const newSetting = yield call(callWxApi, 'openSetting');// 打开设置让用户打开授权
				if (newSetting.authSetting['scope.userInfo']) {
					yield put({ type: 'wxLogin' });
				}
			} else {
				yield put({ type: 'wxLogin' });
			}
		},
		*wxLogin(action, { put }) {
			const loginRes = yield call(callWxApi, 'login');
			const res = yield call(appApi.getOpenid, {
				code: loginRes.code,
				appId: config.appid
			});
			setData('token', res.token.jwtAuthenticationDto.token);
			setData('openid', res.openid);
			const userRes = yield call(appApi.userInfo);
			yield put({ type: 'set', user: userRes });
			if (!userRes.nickname) { // 第一次登录
				wx.navigateTo({ url: '../phoneNumber/phoneNumber' });
				const { userInfo } = yield take('app/updateUserInfoSuccess');
				Object.assign(userRes, userInfo);
				yield put({ type: 'set', user: userRes });
			}
			if (!userRes.mobile) { // 没有手机号
				const pages = getCurrentPages();
				const currentPage = pages[pages.length - 1];
				if (currentPage.route !== 'pages/phoneNumber/phoneNumber') {
					wx.navigateTo({ url: '../phoneNumber/phoneNumber' });
				}
				const { mobile } = yield take('app/getPhoneNumberSuccess');
				userRes.mobile = mobile;
			}
			const wallets = yield call(appApi.walletList);
			yield put({ type: 'loginSuccess', user: userRes, wallets });
			yield put({ type: 'lease/refreshOrder' });
		},
		*getPhoneNumber({ detail }, { put }) {
			const { iv, encryptedData } = detail;
			const res = yield call(appApi.getWxMobile, { iv, encryptedData, openid: getData('openid') });
			const json = JSON.parse(res);
			wx.navigateBack();
			yield put({ type: 'getPhoneNumberSuccess', mobile: json.phoneNumber });
		},
		*updateUserInfo({ info }, { put }) {
			const userInfo = {
				avatar: info.avatarUrl,
				city: info.city,
				gender: info.gender,
				nickname: info.nickName,
				province: info.province,
			};
			yield call(appApi.userUpdate, userInfo);
			yield put({ type: 'updateUserInfoSuccess', userInfo });
		},
	},
	reducers: {
		loginSuccess(state, { user, wallets }) {
			return {
				...state,
				user,
				wallets
			};
		}
	}
});
