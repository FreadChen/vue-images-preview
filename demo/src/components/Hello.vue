<template>
  <div class="preview-test-box">
    <div>点击图片查看图片，有拖拽缩放功能；PC双击缩放；支持移动端手势预览</div>
    <div class="img-box"><img :src="imgs[0]"  @click="$preview({item: imgs[0]},$event)" alt=""></div>
    <div class="img-box">
      <img :src="item" alt="" v-for="(item,$index) in imgs" @click="$preview({item: $index,imgList: imgs},$event)">
    </div>
  </div>
</template>

<script>
import img0 from '../assets/logo.png'
import img1 from '../assets/1.jpg'
import img2 from '../assets/2.jpg'
import img3 from '../assets/3.jpg'
export default {
  name: 'hello',
  data () {
    return {
      imgs: [
        img0,
        img1,
        img2,
        img3
      ]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .preview-test-box{
    width: 100%;
    height: 100%;
  }
  .img-box{
    width: 100%;
    height: 300px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    img{
      height: 200px;
      width: auto;
      vertical-align: middle;
    }
  }


</style>
