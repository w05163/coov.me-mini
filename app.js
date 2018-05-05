// app.js
const config = require('./config');
const { runModel } = require('./models/index');
const appModel = require('./models/app');

runModel(appModel);

App({
	onLaunch(option) {
		// runModel(appModel);
		// runModel(lease);
	},
	onShow(option) {
	},
	data: {

	},
	alert(text, opt) {
		wx.showModal({
			title: config.name,
			content: text,
			cancelColor: '#2770e1',
			confirmColor: '#2770e1',
			showCancel: false,
			...opt
		});
	},
});
