<script setup lang="ts">
import { PhX } from "@phosphor-icons/vue";
import type { Book } from "../services/books";

const open = defineModel<boolean>("open", { default: false });

defineProps<{
  books: Book[];
  loading?: boolean;
  error?: string;
  mode?: "add" | "edit";
  selectedBookId: string;
  minutesRead: number;
  pagesRead: number;
}>();

defineEmits<{
  (e: "close"): void;
  (e: "submit"): void;
  (e: "update:selectedBookId", value: string): void;
  (e: "update:minutesRead", value: number): void;
  (e: "update:pagesRead", value: number): void;
}>();
</script>

<template>
  <div v-if="open" class="overlay" @click.self="$emit('close')">
    <div class="modal" role="dialog" aria-modal="true" :aria-label="mode === 'edit' ? 'Edit session' : 'Add session'">
      <div class="modal__header">
        <h2 class="modal__title">{{ mode === "edit" ? "Edit session" : "Add session" }}</h2>
        <button class="close-btn" type="button" aria-label="Close" @click="$emit('close')">
          <PhX :size="18" weight="light" />
        </button>
      </div>

      <div class="modal__body">
        <div class="form-grid">
          <label class="field">
            <span class="field__label">Book</span>
            <select
              :value="selectedBookId"
              @change="$emit('update:selectedBookId', ($event.target as HTMLSelectElement).value)"
            >
              <option value="" disabled>Select book</option>
              <option v-for="book in books" :key="book._id" :value="book._id">
                {{ book.title }}
              </option>
            </select>
          </label>

          <div class="form-row">
            <label class="field">
              <span class="field__label">Track time</span>
              <input
                :value="minutesRead"
                type="number"
                min="0"
                placeholder="Minutes"
                @input="$emit('update:minutesRead', Number(($event.target as HTMLInputElement).value))"
              />
            </label>

            <label class="field">
              <span class="field__label">&nbsp;</span>
              <input type="text" value="Today" disabled />
            </label>
          </div>

          <label class="field">
            <span class="field__label">Page number</span>
            <input
              :value="pagesRead"
              type="number"
              min="0"
              placeholder="0"
              @input="$emit('update:pagesRead', Number(($event.target as HTMLInputElement).value))"
            />
          </label>

        </div>

        <p v-if="error" class="error" role="alert">{{ error }}</p>
      </div>

      <div class="modal__footer">
        <button class="btn btn--ghost" type="button" @click="$emit('close')">
          Cancel
        </button>
        <button class="btn btn--primary" type="button" :disabled="loading" @click="$emit('submit')">
          {{ loading ? "Saving..." : mode === "edit" ? "Save" : "Add" }}
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
  background: rgba(17, 24, 39, 0.18);
}

.modal {
  width: min(560px, 100%);
  background: #fff;
  border: 1px solid #ece8e3;
  border-radius: 8px;
  box-shadow: 0 18px 45px rgba(38, 31, 24, 0.12);
  overflow: hidden;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 30px;
  border-bottom: 1px solid #efebe6;
}

.modal__title {
  margin: 0;
  font-size: 1.45rem;
  line-height: 1.2;
  color: #222;
  font-weight: 800;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #8b8178;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.modal__body {
  padding: 24px 30px 12px;
}

.form-grid {
  display: grid;
  gap: 18px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field {
  display: grid;
  gap: 10px;
}

.field__label {
  font-size: 0.98rem;
  font-weight: 800;
  color: #4c463f;
}

input,
select {
  width: 100%;
  height: 46px;
  border: 1px solid #ece8e3;
  border-radius: 7px;
  background: #fff;
  padding: 0 14px;
  font: inherit;
  font-size: 1rem;
  color: #2f2a25;
  outline: none;
}

input:disabled {
  color: #8f877f;
  background: #faf9f7;
}

input::placeholder {
  color: #b8aea4;
}

input:focus,
select:focus {
  border-color: rgba(126, 151, 118, 0.75);
  box-shadow: 0 0 0 3px rgba(126, 151, 118, 0.12);
}

.error {
  margin: 18px 0 0;
  padding: 12px 14px;
  border-radius: 7px;
  background: #fef3f2;
  border: 1px solid #fecdca;
  color: #b42318;
  font-size: 0.95rem;
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 18px 30px 24px;
}

.btn {
  min-width: 92px;
  height: 38px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-weight: 800;
  font-size: 12px;
  cursor: pointer;
}

.btn--ghost {
  background: #f5f2ee;
  color: #5f564e;
}

.btn--primary {
  background: #7e9776;
  color: #fff;
}

.btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

@media (max-width: 520px) {
  .overlay {
    padding: 12px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
