import { createRouter, createWebHistory } from "vue-router";
import HomeView from "./views/HomeView.vue";
import LoginView from "./views/LoginView.vue";
import { isLoggedIn } from "./services/auth";
import FavoritesView from "./views/FavoritesView.vue";
import MyLibraryView from "./views/MyLibraryView.vue";
import GoalsView from "./views/GoalsView.vue";
import SessionsView from "./views/SessionsView.vue";
import BookshelvesView from "./views/BookshelvesView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomeView },
    {
      path: "/login",
      component: LoginView,
      meta: { layout: "auth" },
    },
    {
      path: "/favorites",
      component: FavoritesView,
    },
    {
      path: "/library",
      name: "library",
      component: MyLibraryView,
    },
    {
      path: "/goals",
      name: "goals",
      component: GoalsView,
    },
    {
      path: "/sessions",
      name: "sessions",
      component: SessionsView,
    },
    {
      path: "/bookshelves",
      name: "bookshelves",
      component: BookshelvesView,
    },
  ],
});

router.beforeEach((to) => {
  const logged = isLoggedIn();

  if (to.meta.requiresAuth && !logged) {
    return "/login";
  }

  if (!logged && to.path === "/") {
    return "/login";
  }

  if (logged && to.path === "/login") {
    return "/";
  }

  return true;
});
