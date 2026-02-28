<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { Book } from "../../services/books";

const props = defineProps<{
  open: boolean;
  mode: "create" | "edit";
  loading?: boolean;
  error?: string;
  modelValue: Book;
}>();

const emit = defineEmits<{
  (e: "update:open", v: boolean): void;
  (e: "update:modelValue", v: Book): void;
  (e: "submit"): void;
  (e: "close"): void;
}>();

const title = computed(() => (props.mode === "create" ? "Add Book" : "Edit Book"));
const submitLabel = computed(() => (props.mode === "create" ? "Add Book" : "Save changes"));

// local draft so you can type without mutating parent immediately
const draft = reactive<Book>({ ...props.modelValue });

watch(
  () => props.modelValue,
  (v) => Object.assign(draft, v),
  { deep: true, immediate: true }
);

watch(
  () => draft,
  () => emit("update:modelValue", { ...draft }),
  { deep: true }
);

function close() {
  emit("update:open", false);
  emit("close");
}

function onBackdrop(e: MouseEvent) {
  if (e.target === e.currentTarget) close();
}
</script>

<template>
  <div v-if="open" class="modal" @click="onBackdrop">
    <div class="modal__panel" role="dialog" aria-modal="true" :aria-label="title">
      <div class="modal__head">
        <h2 class="modal__title">{{ title }}</h2>
        <button class="iconBtn" type="button" @click="close" aria-label="Close">✕</button>
      </div>

      <p v-if="error" class="formError" role="alert">{{ error }}</p>

      <form class="form" @submit.prevent="emit('submit')">
        <div class="field">
          <label class="label">Title</label>
          <input class="input" v-model.trim="draft.title" required />
        </div>

        <div class="field">
          <label class="label">Author</label>
          <input class="input" v-model.trim="draft.author" required />
        </div>

        <div class="field">
          <label class="label">Image URL</label>
          <input class="input" v-model.trim="draft.image" placeholder="https://..." required />
        </div>

        <div class="row">
          <div class="field">
            <label class="label">Genre</label>
            <input class="input" v-model.trim="draft.genre" />
          </div>

          <div class="field">
            <label class="label">Year</label>
            <input class="input" type="number" v-model.number="draft.publishedYear" />
          </div>
        </div>

        <div class="row">
          <div class="field">
            <label class="label">Price</label>
            <input class="input" type="number" step="0.01" v-model.number="draft.price" />
          </div>

          <label class="check">
            <input type="checkbox" v-model="draft.inStock" />
            <span>In stock</span>
          </label>
        </div>

        <div class="field">
          <label class="label">Description (optional)</label>
          <textarea class="textarea" v-model.trim="draft.description"></textarea>
        </div>

        <div class="actions">
          <button class="btn btn--ghost" type="button" @click="close">Cancel</button>
          <button class="btn btn--primary" :disabled="loading" type="submit">
            {{ loading ? "Saving..." : submitLabel }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* reuse your existing modal styles */
.formError {
  margin: 0 6px 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(180, 35, 24, 0.25);
  background: rgba(180, 35, 24, 0.08);
  color: #b42318;
  font-size: 13px;
  line-height: 1.45;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(31, 36, 48, 0.35);
  display: grid;
  place-items: center;
  padding: 18px;
  z-index: 1000;
}

.modal__panel {
  width: min(560px, 94vw);
  background: #f7f3ee;
  border: 1px solid rgba(31, 36, 48, 0.12);
  border-radius: 18px;
  box-shadow: 0 30px 80px rgba(31, 36, 48, 0.25);
  padding: 16px;
}

.modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 6px 12px;
}

.modal__title {
  margin: 0;
  font-size: 22px;
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
}

.iconBtn {
  height: 38px;
  width: 38px;
  border-radius: 12px;
  border: 1px solid rgba(31, 36, 48, 0.12);
  background: transparent;
  cursor: pointer;
}

.form {
  display: grid;
  gap: 12px;
  padding: 4px 6px 10px;
}

.field {
  display: grid;
  gap: 7px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: end;
}

.label {
  font-size: 12px;
  font-weight: 800;
}

.input,
.textarea {
  border-radius: 12px;
  border: 1px solid rgba(31, 36, 48, 0.12);
  background: rgba(255, 255, 255, 0.7);
  padding: 10px 12px;
  outline: none;
}

.textarea {
  min-height: 110px;
  resize: vertical;
}

.check {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(31, 36, 48, 0.12);
  background: rgba(255, 255, 255, 0.4);
  font-weight: 700;
  color: rgba(31, 36, 48, 0.85);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
}

.btn {
  height: 42px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid rgba(31, 36, 48, 0.12);
  background: transparent;
  font-weight: 800;
  cursor: pointer;
  color: #1f2430;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.btn--primary {
  background: #e5971a;
  border-color: transparent;
  color: white;
}

.btn--ghost:hover {
  background: rgba(31, 36, 48, 0.04);
}

@media (max-width: 860px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>