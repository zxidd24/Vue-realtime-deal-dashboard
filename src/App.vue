<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// 根组件，只负责路由视图
</script>

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%);
  min-height: 100vh;
}
</style>
