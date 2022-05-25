<template>
  <div id="app">
    <a href="/">
      <img :src="image" alt="marvel logo image" />
    </a>
    <br />
    <br />
    <h1>Welcome to Marvel-VueJS application</h1>
    <br />
    <a href="/">Home</a>
    <a href="/characters/page/0">Characters</a>
    <a href="/series/page/0">Series</a>
    <a href="/comics/page/0">Comics</a>
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      image: require("@/assets/logo.png"),
    };
  },
};
</script>

<style>
a {
  padding: 0.4rem 0.8rem;
  background-color: white;
  border-radius: 3px;
  text-decoration: none !important;
  margin: 5px;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
