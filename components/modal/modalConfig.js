module.exports = {
  behaviors: [],
  /**
   * 组件的属性列表
   */
  properties: {
		title: String,
		visible: Boolean,
		style: String,
		cancel: { type: String, value: '取消' },
		submit: { type: String, value: '确认' }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
		onCancel() {
      this.triggerEvent('cancel', {}, {});
		},
		onSubmit() {
      this.triggerEvent('submit', {}, {});
		}
  }
};
