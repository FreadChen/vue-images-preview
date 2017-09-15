/**
 * Created by admin on 2017/8/7.
 * 陈锦浩 写于 2017-8-7
 */
import Vue from 'vue'
let Preview = Vue.extend(require('./vue_preview.vue'))
let myPreview = {
  install: function (vue) {
    // Vue.component('cPreview', vuePreview)
    let instance
    vue.prototype.$preview = function (obj, event) {
      if (!instance) {
        instance = new Preview()
        instance.vm = instance.$mount()
        document.body.appendChild(instance.vm.$el)
      }
      let rect = event ? event.toElement.getBoundingClientRect() : {}
      if (obj.item.length) {
        instance.vm.imgList = obj.item.split(' ')
        instance.vm.index = 0
      } else {
        instance.vm.imgList = []
        if (obj.key) {
          obj.list.map(function (value, i, arr) {
            vue.set(instance.vm.imgList, i, value[obj.key])
          })
        } else {
          instance.vm.imgList = obj.list
        }
        instance.vm.index = obj.item
      }
      // instance.vm.init({
      //   left: rect.left || 0,
      //   top: rect.top || 0,
      //   height: event ? event.target.clientHeight : '100%',
      //   width: event ?event.target.clientWidth : '100%'
      // })
      instance.vm.zoomStatus = false
      instance.vm.top = 0
      instance.vm.left = 0
      instance.vm.X = rect.left
      instance.vm.Y = rect.top
      instance.vm.height = event ? event.target.clientHeight : '100%'
      instance.vm.width = event ? event.target.clientWidth : '100%'
      instance.vm.status = true
    }
  }
}

export default myPreview
