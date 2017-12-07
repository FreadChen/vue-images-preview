<template>
  <transition name="preview" @after-enter="afterEnter">
    <div ref="preview_window" class="v_p_box" v-show="status"
         :style="{left: X?X+'px':0, top: Y?Y+'px':0, width: width?width+'px':'100%', height: height? height + 'px': '100%'}">
      <div v-if="isPC" class="preview_head flex_box ">
        <i class="pointer iconfont icon-zoomout "
           @click="zoomOut()"></i>
        <i class="pointer iconfont icon-ZoomOut"
           @click="zoomIn()"></i>
        <i class="pointer iconfont icon-cuowu" @click="close()"></i>
      </div>
      <div v-if="!isPC && MBshow" class="bottom-tool">
        <div>
          <i class="font-size-30 pointer iconfont icon-cuowu "
             @click="close()"></i>
          <p class="icon-text">关闭</p>
        </div>
        <!--可以扩展一下？-->
      </div>
      <ul
        @drop.prevent="$_drop($event)"
        @touchstart.prevent="tStart($event)"
        @touchmove.prevent="tMove($event)"
        @touchend.prevent="tEnd($event)"
        @touchcancel="tEnd($event)"
        @mousemove="mousemove($event)"
        @mousedown="mousedown($event)"
        @mouseup="mouseup($event)"

        @dblclick="zoom()"
        class="flex_box" >
        <li class="flex_box "
            :style="{left: -100*index + '%',transform: 'scale(' + item.scale.percent + ')','transform-origin': item.scale.sX +' '+ item.scale.sY}"
            v-for="item in imgList" >
          <img :src="item.img" alt="图片加载失败"
                :style="{top: item.y + 'px',left: item.x + 'px'}"
                :class="{ zoom_50: isPC ? zoomStatus : false, ts_LandT: isTS }" ></li>
      </ul>
      <span v-if="isPC" class="arrow_left font-size-30 pointer" v-show="index > 0" @click="leftFn()"><i class="iconfont icon-fanhui"></i></span>
      <span v-if="isPC" class="arrow_right font-size-30 pointer" v-show="index < imgList.length-1" @click="rightFn()"><i class="iconfont icon-gengduo"></i></span>
      <div ref="empty_drag" style="width: 1px;height: 1px;background: white;"></div>
    </div>
  </transition>
</template>
<script type="text/javascript">
  // drag事件因为浏览器的实现不一样，需要很多兼容性代码，而且IE的drag不能取消拖动时的缩影，所以采用mousemove模拟拖动事件
  export default {
    data () {
      // 判断是否为PC端
      let isPC = true
      let userAgentInfo = navigator.userAgent
      const Agents = 'Android iPhone SymbianOS WindowsPhone iPad iPod'.split(' ')
      for (let val of Agents) {
        if (userAgentInfo.indexOf(val) >= 0) {
          isPC = false
          break
        }
      }
      return {
        // 当前图片数据
        nowImg: {},
        // 控制窗口是否显示
        status: false,
        // 图片数据集合
        imgList: [],
        // 当前图片索引
        index: 0,
        // 控制样式
        zoomStatus: false,
        // 拖拽事件的辅助
        dragX: '',
        dragY: '',
        // 拖拽开始？
        dragStatus: false,
        // 是否启用过渡效果
        isTS: true,
        //  盒子的动效需要
        X: 0,
        Y: 0,
        width: '',
        height: '',
        isPC: isPC,
        start: 0,
        touches: {
          start: [],
          move: [],
          scale: 1,
          isPC: true
        },
        toggle: {

        },
        doubleTouch: {
          time: 0,
          count: 0,
          status: false
        },
        // 移动端控制工具条的显示
        MBshow: false
      }
    },
    methods: {
      // 将当前图片数据重置回default
      init () {
        this.nowImg.x = 0
        this.nowImg.y = 0
        this.nowImg.scale.percent = 1
        this.nowImg.scale.sX = 0.5
        this.nowImg.scale.sY = 0.5
      },
      // 动画完成后的回调
      afterEnter () {
        this.X = 0
        this.Y = 0
        this.width = ''
        this.height = ''
      },
      // 关闭窗口
      close () {
        this.status = false
      },
      // 双击缩放
      zoom () {
        this.nowImg.scale.percent = this.nowImg.scale.percent === 1 ? 1.5 : 1
        this.nowImg.x = 0
        this.nowImg.y = 0
      },
      // 放大
      zoomIn () {
        if (this.nowImg.scale.percent >= 2) {
          return
        }
        this.nowImg.scale.percent += 0.5
      },
      // 缩小
      zoomOut () {
        if (this.nowImg.scale.percent <= 1) {
          return
        }
        this.nowImg.scale.percent -= 0.5
        this.nowImg.x = 0
        this.nowImg.y = 0
      },
      // 拖拽开始
      mousedown (event) {
        // 如果触发目标不是IMG则取消本次拖拽
        if (event.target.tagName !== 'IMG') {
          event.stopPropagation()
          event.preventDefault()
          return false
        }
        // 设置拖拽的元素 （IE不支持，可以参考https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/setDragImage）
//        if (typeof event.dataTransfer.setDragImage === 'function') {
//          event.dataTransfer.setDragImage(this.$refs.empty_drag, 0, 0)
//        }
        this.dragX = event.pageX
        this.dragY = event.pageY
        this.isTS = false
        this.dragStatus = true
        event.preventDefault()
      },
      // 拖拽过程
      mousemove (event) {
        // 判断鼠标是否已经按下
        if (this.dragStatus === false) {
          return
        }
        if (event.buttons !== 1) {
          this.dragStatus = false
        }
        // 宽度 = 图片的宽度 * scale （高度适用同样的算法）
        // 如果高或宽不超过窗口的高度或宽度，那么对应维度的拖拽式无效的
        // 如果高或宽超过窗口的高度，拖拽的极限是图像的边与窗口的边对齐
        let w = this.nowImg.scale.percent * event.target.width - this.$refs.preview_window.clientWidth
        let h = this.nowImg.scale.percent * event.target.height - this.$refs.preview_window.clientHeight
        let sX = event.pageX - this.dragX
        let sY = event.pageY - this.dragY
        if (w > 0) {
          let x = this.nowImg.x + sX
          let wScale = w / 2 / this.nowImg.scale.percent
          if (x >= 0) {
            this.nowImg.x = x > wScale ? wScale : x
          } else {
            this.nowImg.x = -x > wScale ? -wScale : x
          }
          this.dragX = event.pageX
          this.dragY = event.pageY
        }
        if (h > 0) {
          let HScale = h / 2 / this.nowImg.scale.percent
          let y = this.nowImg.y + sY
          if (y >= 0) {
            this.nowImg.y = y > HScale ? HScale : y
          } else {
            this.nowImg.y = -y > HScale ? -HScale : y
          }
          this.dragX = event.pageX
          this.dragY = event.pageY
        }
      },
      mouseup (event) {
        this.isTS = true
        this.dragStatus = false
      },
      // 放置动作
      $_drop (event) {
        event.preventDefault()
      },
      leftFn () {
        this.zoomStatus = false
        this.init()
        this.index = this.index - 1 >= 0 ? this.index - 1 : 0
        this.nowImg = this.imgList[this.index]
      },
      rightFn () {
        this.zoomStatus = false
        this.init()
        this.index = (this.index + 1) < this.imgList.length ? this.index + 1 : this.imgList.length - 1
        this.nowImg = this.imgList[this.index]
      },
      tStart (event) {
        this.toggle.status = false
        if (event.touches.length === 1) {
          this.dragX = event.targetTouches[0].pageX
          this.dragY = event.targetTouches[0].pageY
          this.isTS = false
          this.start = 1
          // 判断是不是双击事件
          this.doubleTouch.time = new Date().getTime()
          this.doubleTouch.count += 1
        } else if (event.touches.length === 2) {
          this.start = 2
          this.touches.start = event.targetTouches
          this.touches.scale = this.scale
          // 获取缩放的中心
          // 修改成百分比
          let borderX = this.scaleX * (1 - this.scale) * event.target.width + event.target.parentElement.offsetLeft
          let borderY = this.scaleY * (1 - this.scale) * event.target.width + event.target.parentElement.offsetTop
          let scaleX = ((event.targetTouches[0].pageX + event.targetTouches[1].pageX) / 2 - borderX) / (this.scale * event.target.width)
          let scaleY = ((event.targetTouches[0].pageY + event.targetTouches[1].pageY) / 2 - borderY) / (this.scale * event.target.height)
          this.touches.scaleX = scaleX > 1 ? 1 : scaleX < 0 ? 0 : scaleX
          this.touches.scaleY = scaleY > 1 ? 1 : scaleY < 0 ? 0 : scaleY
        }
      },
      tMove (event) {
        let s1
        if (this.toggle.status) {
          return
        }
        // 判断开始移动前触屏点的数量，1为拖拽，2为缩放
        if (this.start === 1 && event.targetTouches.length === 1) {
          this.left += event.targetTouches[0].pageX - this.dragX
          this.top += event.targetTouches[0].pageY - this.dragY
          this.dragX = event.targetTouches[0].pageX
          this.dragY = event.targetTouches[0].pageY
        } else if (this.start === 2 && event.targetTouches.length === 2) {
          if (Math.abs(this.touches.start[0].pageX - event.targetTouches[0].pageX) < 5 &&
            Math.abs(this.touches.start[0].pageY - event.targetTouches[0].pageY) < 5 &&
            Math.abs(this.touches.start[1].pageX - event.targetTouches[1].pageX) < 5 &&
            Math.abs(this.touches.start[1].pageY - event.targetTouches[1].pageY) < 5
          ) {
            return
          }

          // 计算缩放的倍数，勾股定理
          let x1 = event.targetTouches[0].pageX - event.targetTouches[1].pageX
          let y1 = event.targetTouches[0].pageY - event.targetTouches[1].pageY
          let x2 = this.touches.start[0].pageX - this.touches.start[1].pageX
          let y2 = this.touches.start[0].pageY - this.touches.start[1].pageY
          s1 = Math.sqrt(Math.pow(x1, 2) + Math.pow(y1, 2)) / Math.sqrt(Math.pow(x2, 2) + Math.pow(y2, 2))
          this.scaleX = this.touches.scaleX * 100
          this.scaleY = this.touches.scaleY * 100
          this.scale = this.touches.scale * s1
        }
      },
      tEnd (event) {
        this.isTS = true
        if (this.start === 2) {
          if (this.scale > 2) {
            this.scale = 2
          } else if (this.scale * event.target.width < 150 || this.scale * event.target.height < 200) {
            this.scale = event.target.width > event.target.height ? 200 / event.target.height : 150 / event.target.width
          }
        } else if (this.start === 1) {
          let now = new Date().getTime()
          if (now - this.doubleTouch.time < 100) {
            this.doubleTouch.status = true
            this.debounce(() => {
              var self = this
              switch (this.doubleTouch.count) {
                case 1:
                  // 单击事件
                  self.MBshow = !self.MBshow
                  break
                case 2:
                  // 双击事件
                  self.zoom()
                  break
                default:
                  break
              }
              this.doubleTouch = {
                time: 0,
                count: 0,
                status: false
              }
            }, 100)
          } else if (!this.doubleTouch.status) {
            this.doubleTouch = {
              time: 0,
              count: 0,
              status: false
            }
          }
        }
        this.start = 0
      },
      debounce: function (fn, time) {
        let s
        return (function () {
          if (s) {
            clearTimeout(s)
          }
          s = setTimeout(fn, time)
        })()
      }
    }
  }
</script>
<style lang="scss" scoped>
  /* 可以设置不同的进入和离开动画 */
  /* 设置持续时间和动画函数 */
  *{
    padding: 0;
    margin: 0;
  }
  @font-face {font-family: "iconfont";
    src: url('//at.alicdn.com/t/font_471741_ej8gkswzm1kedn29.eot?t=1510465019029'); /* IE9*/
    src: url('//at.alicdn.com/t/font_471741_ej8gkswzm1kedn29.eot?t=1510465019029#iefix') format('embedded-opentype'), /* IE6-IE8 */
    url('data:application/x-font-woff;charset=utf-8;base64,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') format('woff'),
    url('//at.alicdn.com/t/font_471741_ej8gkswzm1kedn29.ttf?t=1510465019029') format('truetype'), /* chrome, firefox, opera, Safari, Android, iOS 4.2+*/
    url('//at.alicdn.com/t/font_471741_ej8gkswzm1kedn29.svg?t=1510465019029#iconfont') format('svg'); /* iOS 4.1- */
  }

  .iconfont {
    font-family:"iconfont" !important;
    font-size:16px;
    font-style:normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: white;
  }

  .icon-cuowu:before { content: "\e641"; }

  .icon-ZoomOut:before { content: "\e612"; }

  .icon-fanhui:before { content: "\e600"; }

  .icon-gengduo:before { content: "\e601"; }

  .icon-zoomout:before { content: "\e614"; }

  .icon-fullscreen:before { content: "\e6fe"; }

  .icon-narrow:before { content: "\e711"; }
  .font-size-30{
    font-size: 30px;
  }
  .icon-text{
    text-align: center;
    font-size: 14px;
    color: white;
  }

  .preview-leave-active {
    transition: all .1s cubic-bezier(1.0, 0.5, 0.8, 1.0);
    transform: translateX(100%);
  }
  .preview-level-to{
    transform: translateX(100%);
  }
  .pointer{
    cursor: pointer;
  }
  .v_p_box{
    transition: all .5s ease;
    position: fixed;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #3a3a3a;
    top: 0;
    left: 0;
    z-index: 10000;
    >.preview_head{
      position: absolute;
      left: 0;
      top: 0;
      z-index: 99;
      width: 100%;
      box-sizing: border-box;
      padding: 15px;
       background: rgba(78, 78, 78, 0.67);
       box-shadow: -2px 1px 1px 1px #000;
      justify-content: flex-end;
      color: white;
      >i:not(:last-child){
        font-size: 24px;
        margin-right: 15px;
       }
     }
    >ul{
     width:100%;
     height:100%;
     white-space: nowrap;
     overflow: hidden;
     flex-wrap: nowrap;
      >li{
         position: relative;
          transition: left 0.5s;
          left: 0;
         justify-content: center;
          height: 100%;
          min-width: 100%;
          width: 100%;
          overflow: hidden;
          >img{
              position: relative;
             left: 0;
             top: 0;
             transform: scale(1);
             max-width: 100%;
              max-height: 100%;
              width: auto;
             height: auto;
             vertical-align: middle;
            color: #fff;
           }
        >img.zoom_50{
           transition: transform 0.3s;
           transform: scale(1.5);
         }
        >img.ts_LandT{
           transition: transform 0.3s;
          }
       }
     }
  >.arrow_left{
    position: absolute;
    left: 15px;
     top: 50%;
    font-size: 24px;
    display: inline-block;
    margin-top: -17px;
    color: white;
    padding: 5px;
   }
  >.arrow_right{
     position: absolute;
     right: 15px;
     top: 50%;
     font-size: 24px;
     display: inline-block;
     margin-top: -17px;
     color: white;
    padding: 5px;
   }
  }
  .flex_box {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
  }
  .bottom-tool{
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 99;
    width: 100%;
    height: 10%;
    background-color: rgba(0, 0, 0, .1);
  }
</style>
