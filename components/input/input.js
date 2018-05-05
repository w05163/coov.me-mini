/** 带删除图标的input组件 */
const imgs = require('../../assets/imgs');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
		value: String,
		icon: String
  },

  /**
   * 组件的初始数据
   */
  data: {
		imgs
  },

  /**
   * 组件的方法列表
   */
  methods: {
		clear() {
			this.triggerEvent('input', { value: '' });
		},
		input({ detail }) {
			this.triggerEvent('input', detail);
		},
		focus({ detail }) {
			this.triggerEvent('focus', detail);
		},
		blur({ detail }) {
			this.triggerEvent('blur', detail);
		},
		confirm({ detail }) {
			this.triggerEvent('confirm', detail);
		}
  }
});
