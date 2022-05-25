import Vue from "vue";
import Router from "vue-router";
import CharacterList from "./components/CharacterList.vue";
import SeriesList from "./components/SeriesList.vue";
import ComicsList from "./components/ComicsList.vue";
import Character from "./components/Character.vue";
import Series from "./components/Series.vue";
import Comics from "./components/Comics.vue";
import NotFound from "./components/NotFound.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/characters/page/:page",
      name: "CharacterList",
      component: CharacterList,
    },
    {
      path: "/comics/page/:page",
      name: "ComicsList",
      component: ComicsList,
    },
    {
      path: "/series/page/:page",
      name: "SeriesList",
      component: SeriesList,
    },
    {
      path: "/comics/:id",
      name: "Comics",
      component: Comics,
    },
    {
      path: "/series/:id",
      name: "Series",
      component: Series,
    },
    {
      path: "/characters/:id",
      name: "Character",
      component: Character,
    },
    {
      path: "/error",
      component: NotFound,
    },
  ],
});
