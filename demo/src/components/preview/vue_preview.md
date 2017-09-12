# vue-preview插件使用说明
> vue-preview插件是图片查看插件，实现图片切换、放大、拖拽功能。插件比较简单，尚有很大的拓展空间，可以根据需求来拓展插件的功能。

1. 使用示例

~~~
import Vue from 'vue'
import vueprview from './components/vue_preview'
// 装载
Vue.use(vueprview)
// 调用
var vm = new Vue()
vm.$preview(item, imgList, key)
// 或者
@click="$preview({item: detailData.head_portrait}, $event)"
~~~

2. 参数说明

$preview提供三个参数：
   * item - string | number  定义显示的第一张图片，可以是一个图片地址或者是一个索引，为string的时候会忽略后面两个参数，为数字时会索引imgList[item]作为显示的第一张图
   * imgList - Array 要查看的图片列表
   * key - string 非必填，填了以后插件会尝试imgList[item][key]来获取图片的地址


& 作者： 陈锦浩