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
      let rect = event ? event.target.getBoundingClientRect() : {}
      if (typeof obj.item === 'string') {
        instance.imgList = [
          {
            img: obj.item,
            x: 0,
            y: 0,
            scale: {
              percent: 1,
              sX: 0.5,
              sY: 0.5
            }
          }
        ]
        instance.index = 0
      } else {
        let arr = []
        // 如果是object对象
        if (obj.imgList instanceof Object) {
          obj.imgList.map(function (value, i) {
            arr[i] = {
              img: obj.key === undefined ? value : value[obj.key],
              x: 0,
              y: 0,
              scale: {
                percent: 1,
                sX: 0.5,
                sY: 0.5
              }
            }
          })
        }
        instance.imgList = arr
        instance.index = obj.item || 0
      }
      instance.nowImg = instance.imgList[instance.index]
      // instance.init({
      //   left: rect.left || 0,
      //   top: rect.top || 0,
      //   height: event ? event.target.clientHeight : '100%',
      //   width: event ? event.target.clientWidth : '100%'
      // })
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
