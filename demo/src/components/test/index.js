/**
 * Created by admin on 2017/8/7.
 * 陈锦浩 写于 2017-8-7
 */
import Vue from 'vue'
let Preview = Vue.extend(require('./vue_preview.vue').default)

const myPreview = {
  install: function (vue) {
    // Vue.component('cPreview', vuePreview)
    let instance
    if (!this.elm) {
      this.elm = new Preview()
      instance = this.elm.$mount()
      document.body.appendChild(instance.$el)
    }
    vue.prototype.$preview = function (obj, event) {
      let rect = event ? event.toElement.getBoundingClientRect() : {}
      if (obj.item.length) {
        instance.imgList = obj.item.split(' ')
        instance.index = 0
      } else {
        instance.imgList = []
        if (obj.key) {
          obj.list.map(function (value, i, arr) {
            vue.set(instance.imgList, i, value[obj.key])
          })
        } else {
          instance.imgList = obj.list
        }
        instance.index = obj.item
      }
      instance.zoomStatus = false
      instance.top = 0
      instance.left = 0
      instance.X = rect.left
      instance.Y = rect.top
      instance.height = event ? event.target.clientHeight : '100%'
      instance.width = event ? event.target.clientWidth : '100%'
      instance.status = true
    }
  }
}

export default myPreview
