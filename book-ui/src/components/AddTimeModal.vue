<script setup lang="ts">
const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
  loading?: boolean;
  error?: string;
  bookTitle?: string;
  minutesRead: number;
  pagesRead: number;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "submit"): void;
  (e: "update:minutesRead", value: number): void;
  (e: "update:pagesRead", value: number): void;
}>();
</script>

<template>
  <div v-if="open" class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal__header">
        <div>
          <h2 class="modal__title">Add Reading Time</h2>
          <p class="modal__subtitle" v-if="bookTitle">
            {{ bookTitle }}
          </p>
        </div>

        <button class="close-btn" type="button" @click="$emit('close')">
          ✕
        </button>
      </div>

      <div class="modal__body">
        <div class="form-grid">
          <label class="field">
            <span class="field__label">Minutes read</span>
            <input
              :value="minutesRead"
              type="number"
              min="0"
              placeholder="e.g. 30"
              @input="$emit('update:minutesRead', Number(($event.target as HTMLInputElement).value))"
            />
          </label>

          <label class="field">
            <span class="field__label">Pages read</span>
            <input
              :value="pagesRead"
              type="number"
              min="0"
              placeholder="e.g. 12"
              @input="$emit('update:pagesRead', Number(($event.target as HTMLInputElement).value))"
            />
          </label>
        </div>

        <p v-if="error" class="error">{{ error }}</p>
      </div>

      <div class="modal__footer">
        <button class="btn btn--ghost" type="button" @click="$emit('close')">
          Cancel
        </button>

        <button class="btn btn--primary" type="button" @click="$emit('submit')">
          {{ loading ? "Saving..." : "Save session" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
}

.modal {
  width: min(460px, 100%);
  background: #fcfaf7;
  border: 1px solid rgba(31, 36, 48, 0.12);
  border-radius: 22px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.2);
  overflow: hidden;
}

.modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 22px 16px;
  border-bottom: 1px solid rgba(31, 36, 48, 0.08);
}

.modal__title {
  margin: 0;
  font-size: 1.6rem;
  line-height: 1.08;
  color: #1f2430;
  font-family: ui-serif, Georgia, Cambria, serif;
}

.modal__subtitle {
  margin: 6px 0 0;
  color: #667085;
  font-size: 0.95rem;
}

.close-btn {
  width: 42px;
  height: 42px;
  border: 1px solid rgba(31, 36, 48, 0.08);
  border-radius: 999px;
  background: white;
  cursor: pointer;
}

.modal__body {
  padding: 20px 22px 10px;
}

.form-grid {
  display: grid;
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
}

.field__label {
  font-size: 0.95rem;
  font-weight: 700;
  color: #344054;
}

input {
  width: 100%;
  border: 1px solid rgba(31, 36, 48, 0.12);
  border-radius: 14px;
  background: white;
  padding: 13px 14px;
  font: inherit;
  color: #1f2430;
  outline: none;
  box-sizing: border-box;
}

.error {
  margin: 16px 0 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: #fef3f2;
  border: 1px solid #fecdca;
  color: #b42318;
  font-size: 0.9rem;
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 18px 22px 22px;
  border-top: 1px solid rgba(31, 36, 48, 0.08);
}

.btn {
  height: 46px;
  padding: 0 18px;
  border-radius: 14px;
  border: 1px solid rgba(31, 36, 48, 0.12);
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
}

.btn--ghost {
  background: white;
  color: #344054;
}

.btn--primary {
  background: #7e9776;
  color: white;
  border-color: transparent;
}
</style>