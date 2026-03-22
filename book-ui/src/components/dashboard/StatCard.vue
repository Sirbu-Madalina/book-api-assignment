<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  hint?: string;
}>();
</script>

<template>
  <div class="card">
    <p class="label">{{ label }}</p>
    <h3 class="value">{{ value }}</h3>
    <p v-if="hint" class="hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.card {
  padding: 18px;
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.label {
  font-size: 0.9rem;
  color: var(--text-soft);
}

.value {
  font-size: 1.8rem;
  margin-top: 6px;
  color: var(--text);
}

.hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 4px;
}
</style>