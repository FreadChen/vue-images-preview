<template>
  <transition name="preview" @after-enter="beforeEnter">
    <div class="v_p_box" v-show="status"
         :style="{left: X?X+'px':0, top: Y?Y+'px':0, width: width?width+'px':'100%', height: height? height + 'px': '100%'}">
      <div class="preview_head flex_box iconfont ">
        <i v-if="isPC" class="el-icon-view pointer iconfont icon-zoomout "
           @click="zoomIn()"></i>
        <i v-if="isPC" class="el-icon-view pointer el-icon-view"
           @click="zoomOut()"></i>
        <i class="el-icon-close pointer" @click="close()"></i>
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
               :style="{top: top + 'px',left: left + 'px',transform: 'scale(' + scale + ')','transform-origin': scaleX*100 +'% '+scaleY*100 + '%'}"
               :class="{ zoom_50: isPC?zoomStatus:false, ts_LandT: isTS }"
          ><img :src="item" alt="图片加载失败"
                @dblclick="zoom()" ></div></li>
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
      let isPC
      let userAgentInfo = navigator.userAgent
      let Agents = 'Android iPhone SymbianOS Windows Phone iPad iPod'
      if (userAgentInfo.indexOf(Agents) > 0) { isPC = false }
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
      beforeEnter () {
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
  .preview-leave-active {
    transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
    transform: translateX(100%);
  }
  .preview-level-to{
    transform: translateX(100%);
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
</style>
