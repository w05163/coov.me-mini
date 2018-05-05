// index.js
const { getStoreToPage } = require('../../utils/pageUtil');

getStoreToPage(
	{
		data: {
		},
		componentWillReceiveProps(nextProps) {

		},

		onLoad() {
		},
		onShow() {

		},
		onHide() {
		},
		onUnload() {
		}
	},
	'app.user',
	'app.batteryMode',
	'lease.order',
	'lease.power'
);
