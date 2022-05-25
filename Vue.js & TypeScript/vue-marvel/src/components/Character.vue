<template>
  <div>
    <h1>{{ this.show.name }}</h1>
    <br />
    <img :src="this.show.image" :alt="this.show.name + 'image'" />
    <br />
    <span v-html="this.show.summary"></span>
    <br />
    <h2>Comics:</h2>
    <ul>
      <li v-for="(show, index) in comics" :key="index">
        <a :href="'/comics/' + show.id">{{ show.name }}</a>
      </li>
    </ul>
    <h2>Series:</h2>
    <ul>
      <li v-for="(show, index) in series" :key="index">
        <a :href="'/series/' + show.id">{{ show.name }}</a>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from "axios";
import { ts, publickey, hash, baseUrl } from "../assets/api";

export default {
  name: "Character",
  data() {
    return {
      id: this.$route.params.id,
      show: { name: null, image: { medium: null }, summary: null },
      name: null,
      shows: [],
      comics: [],
      series: [],
    };
  },
  methods: {
    async getShow(id) {
      const {
        data: { data },
      } = await axios.get(
        `${baseUrl}/characters/${id}?ts=${ts}&apikey=${publickey}&hash=${hash}`
      );
      this.shows = data.results;
      this.show.name = data.results[0].name;
      this.show.image = data.results[0].thumbnail.path;
      this.show.image = this.show.image + "/portrait_xlarge.jpg";
      this.show.summary =
        data.results[0].description !== "" || data.results[0].description === undefined
          ? data.results[0].description
          : `This doesn't need any introduction `;
      this.comics = data.results[0].comics.items;
      this.series = data.results[0].series.items;
      this.comics.map((item) => {
        let id = item.resourceURI.split("/");
        item.id = id[id.length - 1];
      });
      this.series.map((item) => {
        let id = item.resourceURI.split("/");
        item.id = id[id.length - 1];
      });
      console.log(data.results);
      console.log(this.comics);
    },
  },
  async created() {
    await this.getShow(this.$route.params.id);
  },
  watch: {
    $route() {
      this.getShow(this.$route.params.id);
    },
  },
};
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}

span {
  text-align: center;
  max-width: 50%;
}
div {
  max-width: 50%;
  margin: 0 auto;
}
</style>
