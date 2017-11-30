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
          <img :src="item" alt="图片加载失败" @touchstart.prevent="tStart($event)"
                @touchmove.prevent="tMove($event)"
                @touchend.prevent="tEnd($event)"
                @touchcancel="tEnd($event)"
                @dragover.prevent="dragPosition($event)"
                @dragstart="dragstart($event)"
                @dragend="dragend($event)"
                @dblclick="zoom()"
                :style="{top: top + 'px',left: left + 'px',transform: 'scale(' + scale + ')','transform-origin': 50 +'% '+50 + '%'}"
                :class="{ zoom_50: isPC ? zoomStatus : false, ts_LandT: isTS }" ></li>
      </ul>
      <span class="arrow_left pointer" v-show="index > 0" @click="leftFn()"><i class="iconfont icon-fanhui"></i></span>
      <span class="arrow_right pointer" v-show="index < imgList.length-1" @click="rightFn()"><i class="iconfont icon-gengduo"></i></span>
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
//        if (this.scale === 1) {
//          this.left = this.top = 0
//        }
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
        this.index = (this.index + 1) < this.imgList.length ? this.index + 1 : this.imgList.length - 1
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
    src: url('//at.alicdn.com/t/font_471741_liz72ymwrue7mn29.eot?t=1510403618688'); /* IE9*/
    src: url('//at.alicdn.com/t/font_471741_liz72ymwrue7mn29.eot?t=1510403618688#iefix') format('embedded-opentype'), /* IE6-IE8 */
    url('data:application/x-font-woff;charset=utf-8;base64,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') format('woff'),
    url('//at.alicdn.com/t/font_471741_liz72ymwrue7mn29.ttf?t=1510403618688') format('truetype'), /* chrome, firefox, opera, Safari, Android, iOS 4.2+*/
    url('//at.alicdn.com/t/font_471741_liz72ymwrue7mn29.svg?t=1510403618688#iconfont') format('svg'); /* iOS 4.1- */
  }

  .iconfont {
    font-family:"iconfont" !important;
    font-size:16px;
    font-style:normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .icon-ZoomOut:before { content: "\e612"; }

  .icon-fanhui:before { content: "\e600"; }

  .icon-gengduo:before { content: "\e601"; }

  .icon-zoomout:before { content: "\e614"; }

  .icon-fullscreen:before { content: "\e6fe"; }

  .icon-narrow:before { content: "\e711"; }
  .icon-gengduo,.icon-fanhui{
    font-size: 30px;
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
             left: 0;
             top: 0;
             transform: scale(1);
             position: relative;
             max-width: 100%;
              max-height: 100%;
              width: auto;
             height: auto;
             vertical-align: middle;
             cursor: all-scroll;
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
</style>
