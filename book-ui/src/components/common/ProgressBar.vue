<script setup lang="ts">
const props = defineProps<{
  value: number;
  max: number;
}>();

const percent = Math.round((props.value / props.max) * 100);
</script>

<template>
  <div class="progress">
    <div class="fill" :style="{ width: percent + '%' }"></div>
  </div>
</template>

<style scoped>
.progress {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: #ddd;
  overflow: hidden;
}

.fill {
  height: 100%;
  background: var(--green);
}
</style>