<script setup lang="ts">
import { isLoggedIn, logout } from "./services/auth";
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const loggedIn = computed(() => isLoggedIn());
const isAuthLayout = computed(() => route.meta.layout === "auth");

function onLogout() {
  logout();
  router.push("/login");
}
</script>

<template>
  <header v-if="!isAuthLayout" class="top">
    <h1>Book UI</h1>

    <nav class="nav">
      <RouterLink to="/">Books</RouterLink>
      <RouterLink to="/login" v-if="!loggedIn">Login</RouterLink>
      <button v-else class="btn" @click="onLogout">Logout</button>
    </nav>
  </header>

  <!-- If login page: render full-screen without container -->
  <main v-if="!isAuthLayout" class="container">
    <RouterView />
  </main>

  <RouterView v-else />
</template>

<style scoped>
.top {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 28px;
  background: #f7f3ee;
  border-bottom: 1px solid rgba(31, 36, 48, 0.12);
}

.top h1 {
  margin: 0;
  font-size: 22px;
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  letter-spacing: -0.02em;
  color: #1f2430;
}

.nav {
  display: flex;
  gap: 14px;
  align-items: center;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px;
}

.btn {
  padding: 10px 14px;
  border: 1px solid rgba(31, 36, 48, 0.18);
  background: transparent;
  color: #1f2430;
  border-radius: 12px;
  cursor: pointer;
}
.btn:hover {
  background: rgba(31, 36, 48, 0.04);
}
</style>