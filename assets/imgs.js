/**
 * 所有引用的图片地址
 */
const config = require('../config');

const imgs = {
	batteryLeaseBtnTypeNor: 'battery_lease_btn_type_nor.png',
};

const locImgs = {
	homeTabImg: 'home_tab_img.png'
};

Object.keys(imgs).forEach(k => imgs[k] = `${config.imgUrl}${imgs[k]}`);
Object.keys(locImgs).forEach(k => imgs[k] = `../../assets/${locImgs[k]}`);

module.exports = imgs;
