<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isAuthLayout = computed(() => route.meta.layout === "auth");
</script>

<template>
  <main :class="{ authPage: isAuthLayout }">
    <RouterView />
  </main>
</template>

<style scoped>
.authPage {
  min-height: 100vh;
}
</style>