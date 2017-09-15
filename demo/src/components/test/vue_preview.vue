<template>
  <transition name="preview" @after-enter="afterEnter">
    <div class="v_p_box" v-show="status"
         :style="{left: X?X+'px':0, top: Y?Y+'px':0, width: width?width+'px':'100%', height: height? height + 'px': '100%'}">
      <div class="preview_head flex_box iconfont ">
        <i v-if="isPC" class="el-icon-view pointer iconfont icon-zoomout "
           @click="zoomOut()"></i>
        <i v-if="isPC" class="el-icon-view pointer iconfont icon-ZoomOut"
           @click="zoomIn()"></i>
        <i class="el-icon-close pointer icon-narrow" @click="close()"></i>
      </div>
      <ul
        class="flex_box" style="cursor: default" >
        <li class="flex_box "
            :style="{left: -100*index + '%'}"
            v-for="item in imgList" >
          <div
               @touchstart.prevent="tStart($event)"
               @touchmove.prevent="tMove($event)"
               @touchend.prevent="tEnd($event)"
               @touchcancel="tEnd($event)"
               @dragover.prevent="dragPosition($event)"
               @dragstart="dragstart($event)"
               @dragend="dragend($event)"
               @dblclick="zoom()"
               :style="{top: top + 'px',left: left + 'px',transform: 'scale(' + scale + ')','transform-origin': scaleX*100 +'% '+scaleY*100 + '%'}"
               :class="{ zoom_50: isPC?zoomStatus:false, ts_LandT: isTS }"
          ><img :src="item" alt="图片加载失败" ></div></li>
      </ul>
      <span class="arrow_left pointer" v-show="index>0" @click="leftFn()"><i class="el-icon-arrow-left"></i></span>
      <span class="arrow_right pointer" v-show="index<imgList.length-1" @click="rightFn()"><i class="el-icon-arrow-right"></i></span>
      <div ref="empty_drag" style="width: 1px;height: 1px;background: white;"></div>
    </div>
  </transition>
</template>
<script type="text/javascript">
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
        status: false,
        imgList: [],
        index: 0,
        zoomStatus: false,
        top: 0,
        left: 0,
        dragX: '',
        dragY: '',
        isTS: true,
        X: 0,
        Y: 0,
        width: '',
        height: '',
        scale: 1,
        scaleX: 0,
        scaleY: 0,
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
        }
      }
    },
    methods: {
      init (obj) {
        if (!(obj instanceof Object)) {
          obj = {}
        }
        this.zoomStatus = false
        this.top = 0
        this.left = 0
        this.X = obj.top || 0
        this.Y = obj.left || 0
        this.width = obj.width || ''
        this.height = obj.height || ''
        this.scale = 1
        this.scaleX = 0
        this.scaleY = 0
        this.status = true
      },
      // 动画完成后的回调
      afterEnter () {
        this.X = 0
        this.Y = 0
        this.width = ''
        this.height = ''
      },
      close () {
        this.status = false
      },
      zoom () {
        this.scale = this.scale === 1 ? 1.5 : 1
        if (this.scale === 1) {
          this.left = this.top = 0
        }
      },
      zoomIn () {
        if (this.scale >= 2) {
          return
        }
        this.scale = this.scale >= 1 ? this.scale + 0.5 : this.scale + 0.25
      },
      zoomOut () {
        if (this.scale <= 0.5) {
          return
        }
        this.scale = this.scale > 1 ? this.scale - 0.5 : this.scale - 0.25
      },
      dragstart (event) {
        event.dataTransfer.setDragImage(this.$refs.empty_drag, 0, 0)
        this.dragX = event.pageX
        this.dragY = event.pageY
        this.isTS = false
      },
      dragPosition (event) {
        this.left += event.pageX - this.dragX
        this.top += event.pageY - this.dragY
        this.dragX = event.pageX
        this.dragY = event.pageY
      },
      dragend (event) {
        this.isTS = true
      },
      leftFn () {
        this.zoomStatus = false
        this.index = this.index - 1 >= 0 ? this.index - 1 : 0
        this.init()
      },
      rightFn () {
        this.zoomStatus = false
        this.index = this.index + 1 < this.imgList.length ? this.index + 1 : this.imgList.length - 1
        this.init()
      },
      tStart (event) {
        this.toggle.status = false
        if (event.touches.length === 1) {
          this.dragX = event.targetTouches[0].pageX
          this.dragY = event.targetTouches[0].pageY
          this.isTS = false
          this.start = 1
          // 判断是不是双击事件
          // 第二次点击
          if (this.doubleTouch.count) {
            let time = new Date().getTime()
            if (time - this.doubleTouch.time < 400) {
              this.zoom()
            }
            this.doubleTouch.count = 0
            this.doubleTouch.time = 0
          } else {
            // 记录第一次点击
            this.doubleTouch.time = new Date().getTime()
            this.doubleTouch.count = 1
          }
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
          this.scaleX = this.touches.scaleX
          this.scaleY = this.touches.scaleY
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
        }
        this.start = 0
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
    src: url('//at.alicdn.com/t/font_379257_k6be74bm9veipb9.eot?t=1505179654861'); /* IE9*/
    src:
    url('data:application/x-font-woff;charset=utf-8;base64,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') format('woff'),
    url('//at.alicdn.com/t/font_379257_k6be74bm9veipb9.ttf?t=1505179654861') format('truetype'), /* chrome, firefox, opera, Safari, Android, iOS 4.2+*/
    url('//at.alicdn.com/t/font_379257_k6be74bm9veipb9.svg?t=1505179654861#iconfont') format('svg'); /* iOS 4.1- */
  }

  .iconfont {
    font-family:"iconfont" !important;
    font-size:16px;
    font-style:normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .icon-ZoomOut:before { content: "\e612"; }

  .icon-zoomout:before { content: "\e614"; }

  .icon-fullscreen:before { content: "\e6fe"; }

  .icon-narrow:before { content: "\e711"; }

  .preview-leave-active {
    transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
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
        >div{
           left: 0;
           top: 0;
           position: relative;
           transform: scale(1);
          >img{
             position: relative;
             max-width: 100%;
              max-height: 100%;
              width: auto;
             height: auto;
             vertical-align: middle;
             cursor: all-scroll;
            color: #fff;
           }
         }
        >div.zoom_50{
           transition: transform 0.5s;
           transform: scale(1.5);
         }
        >div.ts_LandT{
           transition: transform 0.5s;
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
</style>
