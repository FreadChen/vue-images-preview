<template>
  <div class="hello">
    <h1 style="cursor: pointer">{{ msg }}</h1>
    <h2 @click="$preview({item:'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1504782841521&di=691463da0ddd39d05b4d2f8ae1402c10&imgtype=0&src=http%3A%2F%2Fpic.58pic.com%2F58pic%2F15%2F01%2F86%2F60V58PICF8v_1024.jpg'})" >点击测试</h2>
  </div>
</template>

<script>
export default {
  name: 'hello',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

div{
  h1, h2 {
    font-weight: normal;
    color: aqua;
  }
}

</style>
