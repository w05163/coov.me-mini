module.exports = {
	callWxApi(name, params) {
		return new Promise((resolve, ret) => {
			wx[name]({
				...params,
				success: resolve,
				fail: ret
			});
		});
	}
};
