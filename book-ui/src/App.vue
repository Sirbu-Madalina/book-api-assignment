<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import Navbar from "./components/Navbar.vue";

const route = useRoute();

const isAuthLayout = computed(() => route.meta.layout === "auth");
</script>

<template>
  <Navbar v-if="!isAuthLayout" />

  <main :class="{ 'container': !isAuthLayout }">
    <RouterView />
  </main>
</template>

<style>
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px;
}
</style>