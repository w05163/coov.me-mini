/**
 * 提供注册页面等工具
 */
const { connect } = require('../models/index');
const imgs = require('../assets/imgs');
const { getStore } = require('./getStore');

const basePage = {
	data: {
		imgs
	},
	navigate(e) {
		const url = e.currentTarget.dataset.url;
		wx.navigateTo({ url });
	},
	getPage(route) {
		const pages = getCurrentPages();
		return pages.find(p => p.route === route);
	},
	goTo(url) {
		wx.navigateTo({ url });
	},
	back() {
		wx.navigateBack();
	}
};

/**
 * 实现继承Page
 */
function extendsPage(...arr) {
	if (arr.length <= 1)arr.push(basePage);
	const target = arr.reduce((p, v) => {
		return {
			...v,
			...p,
			data: {
				...v.data,
				...p.data
			}
		};
	}, {});
	return target;
}

function connectPage(page, mapStateToProps) {
	return Page(connect(mapStateToProps)(extendsPage(page)));
}

function getStoreToPage(page, ...args) {
	return Page(connect(getStore(...args))(extendsPage(page)));
}

module.exports = {
	extendsPage,
	connectPage,
	getStoreToPage
};
