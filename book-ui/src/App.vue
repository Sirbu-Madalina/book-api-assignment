<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { isLoggedIn, logout } from "./services/auth";
import { PhSignOut } from "@phosphor-icons/vue";

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
    <div class="top__inner">
      <h1 class="brand">Book UI</h1>

      <button v-if="loggedIn" class="signout" type="button" @click="onLogout">
        <PhSignOut :size="18" />
        <span>Sign out</span>
      </button>
    </div>
  </header>

  <main v-if="!isAuthLayout" class="container">
    <RouterView />
  </main>

  <RouterView v-else />
</template>

<style scoped>
/* Header background full width */
.top {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #f7f3ee;
  border-bottom: 1px solid rgba(31, 36, 48, 0.12);
}

/* THIS is what aligns with the page container */
.top__inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 18px 28px;

  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  margin: 0;
  font-size: 22px;
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  letter-spacing: -0.02em;
  color: #1f2430;
}

/* Page container */
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px;
}

/* Sign out button */
.signout {
  display: inline-flex;
  align-items: center;
  gap: 10px;

  padding: 10px 14px;
  border: 1px solid rgba(31, 36, 48, 0.18);
  background: transparent;
  color: #1f2430;
  border-radius: 12px;
  cursor: pointer;
}

.signout:hover {
  background: rgba(31, 36, 48, 0.04);
}
</style>