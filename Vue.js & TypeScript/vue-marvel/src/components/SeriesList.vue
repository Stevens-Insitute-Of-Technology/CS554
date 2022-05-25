<template>
  <b-container fluid="md">
    <div v-if="noData" class="row">
      <div class="col-12">
        <h2>Loading...</h2>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <b-button
          :disabled="this.previousDisable"
          variant="danger"
          :href="'/characters/page/' + (this.page - 1)"
          >Previous</b-button
        >
      </div>
      <div class="col">
        <b-button
          :disabled="this.nextDisable"
          variant="danger"
          :href="'/characters/page/' + (this.page + 1)"
          >Next</b-button
        >
      </div>
    </div>
    <div class="row">
      <div class="col-md-4" v-for="(show, index) in shows" :key="index">
        <div class="card h-100">
          <img
            class="card-img-top"
            :src="show.thumbnail.path + '/portrait_xlarge.jpg'"
            :alt="show.name + 'Image'"
            @error="$event.target.src = image"
          />
          <div class="card-body">
            <h2 class="card-title">{{ show.title }}</h2>
            <b-button :href="'/series/' + show.id" variant="primary"
              >See Series Deatils</b-button
            >
          </div>
        </div>
      </div>
    </div>
  </b-container>
</template>

<script>
import axios from "axios";
import { seriesUrl } from "../assets/api";
export default {
  name: "SeriesList",
  data() {
    return {
      page: this.$route.params.page,
      shows: [],
      image: require("@/assets/no-image.jpg"),
      noData: true,
      totalPages: 0,
      nextDisable: false,
      previousDisable: true,
    };
  },
  async created() {
    this.page = Number(this.page);
    let offset = this.page * 15;
    try {
      const {
        data: { data },
      } = await axios.get(`${seriesUrl}&offset=${offset}&limit=15`);
      if (data && data.results) {
        this.noData = false;
      }
      this.shows = data.results;
      this.totalPages = Math.ceil(data.total / 15);
      console.log(this.totalPages);
      if (this.page === 0) {
        this.previousDisable = true;
      } else {
        this.previousDisable = false;
      }
      if (this.page + 1 === this.totalPages) {
        this.nextDisable = true;
      } else {
        this.nextDisable = false;
      }
    } catch (error) {
      if (error.response.status === 404 || error.response.status === 500) {
        this.$router.push({ path: "/error" });
      }
    }
  },
};
</script>

<style scoped>
ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

ul li {
  padding: 20px;
  font-size: 1.3em;
  background-color: #e0edf4;
  border-left: 5px solid #3eb3f6;
  margin-bottom: 2px;
  color: #3e5252;
}

p {
  text-align: center;
  padding: 30px 0;
  color: gray;
}
.btn-danger:disabled,
.btn-danger.disabled {
  color: #ffffff !important;
  background-color: #000000 !important;
  border-color: #000000 !important;
}
.btn-danger {
  background-color: #a11227 !important;
}
</style>
