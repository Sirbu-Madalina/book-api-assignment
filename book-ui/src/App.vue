<script setup lang="ts">
import { isLoggedIn, logout } from "./services/auth";
import { computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const loggedIn = computed(() => isLoggedIn());

function onLogout() {
  logout();
  router.push("/login");
}
</script>

<template>
  <header class="top">
    <h1>Book UI</h1>

    <nav class="nav">
      <RouterLink to="/">Books</RouterLink>
      <RouterLink to="/login" v-if="!loggedIn">Login</RouterLink>
      <button v-else class="btn" @click="onLogout">Logout</button>
    </nav>
  </header>

  <main class="container">
    <RouterView />
  </main>
</template>

<style scoped>
.top { display:flex; align-items:center; justify-content:space-between; padding:16px; border-bottom:1px solid #2b2b2b; }
.nav { display:flex; gap:12px; align-items:center; }
.container { max-width: 980px; margin: 0 auto; padding: 16px; }
.btn { padding: 8px 12px; border: 1px solid #444; background: transparent; color: inherit; border-radius: 8px; cursor:pointer; }
</style>