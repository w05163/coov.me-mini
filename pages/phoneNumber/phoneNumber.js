// 选择型号，支付页面
const { getStoreToPage } = require('../../utils/pageUtil');
const config = require('../../config');

getStoreToPage({
	data: {
		name: config.name
	},
	getPhoneNumber({ detail }) {
		if (detail.iv && detail.encryptedData) { // 获取到加密信息，交给后端解析
			this.props.dispatch({ type: 'app/getPhoneNumber', detail });
		}
	},
	getUserInfo({ detail: { userInfo: info } }) {
		this.props.dispatch({ type: 'app/updateUserInfo', info });
	}
},
'app.user'
);
