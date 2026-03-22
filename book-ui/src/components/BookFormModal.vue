<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { Book } from "../services/books";

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

const title = computed(() =>
  props.mode === "create" ? "Add book" : "Edit book"
);

const submitLabel = computed(() =>
  props.mode === "create" ? "Add book" : "Save changes"
);

const draft = reactive<Book>({
  ...props.modelValue,
  stockQuantity: props.modelValue.stockQuantity ?? 0,
});

watch(
  () => props.modelValue,
  (v) => Object.assign(draft, v),
  { deep: true, immediate: true }
);

watch(
  () => draft,
  () => {
    draft.inStock = (draft.stockQuantity || 0) > 0;
    emit("update:modelValue", { ...draft });
  },
  { deep: true }
);

const stockStatus = computed(() =>
  (draft.stockQuantity || 0) > 0 ? "In stock" : "Out of stock"
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

      <form class="layout" @submit.prevent="emit('submit')">
        <aside class="previewCard">
          <div class="coverWrap">
            <img
              v-if="draft.image"
              :src="draft.image"
              :alt="draft.title || 'Book cover'"
              class="cover"
            />
            <div v-else class="coverPlaceholder">No image</div>
          </div>

          <div class="previewInfo">
            <h3 class="previewTitle">{{ draft.title || "Untitled book" }}</h3>
            <p class="previewAuthor">{{ draft.author || "Unknown author" }}</p>

            <div class="metaList">
              <div class="metaItem">
                <span class="metaLabel">Genre</span>
                <span class="metaValue">{{ draft.genre || "—" }}</span>
              </div>

              <div class="metaItem">
                <span class="metaLabel">Year</span>
                <span class="metaValue">{{ draft.publishedYear || "—" }}</span>
              </div>

              <div class="metaItem">
                <span class="metaLabel">Price</span>
                <span class="metaValue">${{ Number(draft.price || 0).toFixed(2) }}</span>
              </div>

              <div class="metaItem">
                <span class="metaLabel">Stock</span>
                <span class="metaValue">{{ draft.stockQuantity || 0 }} pcs</span>
              </div>
            </div>

            <span
              :class="[
                'stockBadge',
                (draft.stockQuantity || 0) > 0 ? 'stockBadge--success' : 'stockBadge--danger'
              ]"
            >
              {{ stockStatus }}
            </span>
          </div>
        </aside>

        <section class="formCard">
          <div class="formGrid">
            <div class="field field--full">
              <label class="label">Title</label>
              <input class="input" v-model.trim="draft.title" required />
            </div>

            <div class="field field--full">
              <label class="label">Author</label>
              <input class="input" v-model.trim="draft.author" required />
            </div>

            <div class="field field--full">
              <label class="label">Image URL</label>
              <input
                class="input"
                v-model.trim="draft.image"
                placeholder="Paste image URL"
                required
              />
            </div>

            <div class="field">
              <label class="label">Genre</label>
              <input class="input" v-model.trim="draft.genre" placeholder="Fiction" />
            </div>

            <div class="field">
              <label class="label">Year</label>
              <input class="input" type="number" v-model.number="draft.publishedYear" />
            </div>

            <div class="field">
              <label class="label">Price</label>
              <input class="input" type="number" step="0.01" min="0" v-model.number="draft.price" />
            </div>

            <div class="field">
              <label class="label">Stock quantity</label>
              <input class="input" type="number" min="0" v-model.number="draft.stockQuantity" />
            </div>

            <div class="field field--full">
              <label class="label">Description</label>
              <textarea
                class="textarea"
                v-model.trim="draft.description"
                placeholder="Write a short description..."
              ></textarea>
            </div>
          </div>

          <div class="actions">
            <button class="btn btn--ghost" type="button" @click="close">Cancel</button>
            <button class="btn btn--primary" :disabled="loading" type="submit">
              {{ loading ? "Saving..." : submitLabel }}
            </button>
          </div>
        </section>
      </form>
    </div>
  </div>
</template>

<style scoped>
.formError {
  margin: 0 0 14px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(180, 35, 24, 0.18);
  background: #fff1f0;
  color: #b42318;
  font-size: 13px;
  line-height: 1.45;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.48);
  backdrop-filter: blur(5px);
  display: grid;
  place-items: center;
  padding: 24px;
  z-index: 1000;
}

.modal__panel {
  width: min(980px, 96vw);
  max-height: 92vh;
  overflow: auto;
  background: #fcfaf7;
  border: 1px solid rgba(31, 36, 48, 0.08);
  border-radius: 28px;
  box-shadow: 0 28px 90px rgba(15, 23, 42, 0.22);
  padding: 24px;
}

.modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.modal__title {
  margin: 0;
  font-size: 2rem;
  line-height: 1.1;
  color: #1f2430;
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
}

.iconBtn {
  height: 44px;
  width: 44px;
  border-radius: 14px;
  border: 1px solid rgba(31, 36, 48, 0.1);
  background: white;
  cursor: pointer;
  font-size: 1rem;
  color: #344054;
  transition: 0.2s ease;
  flex-shrink: 0;
}

.iconBtn:hover {
  background: #f8fafc;
}

.layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 22px;
  align-items: start;
}

.previewCard {
  background: linear-gradient(180deg, #f8f4ee 0%, #f3ede4 100%);
  border: 1px solid rgba(31, 36, 48, 0.08);
  border-radius: 22px;
  padding: 18px;
  position: sticky;
  top: 0;
}

.coverWrap {
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 18px;
  overflow: hidden;
  background: #ece7df;
  margin-bottom: 16px;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.coverPlaceholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: #667085;
  font-weight: 700;
}

.previewInfo {
  display: grid;
  gap: 12px;
}

.previewTitle {
  margin: 0;
  font-size: 1.2rem;
  line-height: 1.3;
  color: #1f2430;
  font-weight: 800;
}

.previewAuthor {
  margin: 0;
  color: #667085;
  font-size: 0.95rem;
}

.metaList {
  display: grid;
  gap: 10px;
}

.metaItem {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(31, 36, 48, 0.08);
}

.metaLabel {
  color: #667085;
  font-size: 0.85rem;
}

.metaValue {
  color: #1f2430;
  font-size: 0.9rem;
  font-weight: 700;
  text-align: right;
}

.stockBadge {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  padding: 0.42rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
}

.stockBadge--success {
  background: #ecfdf3;
  color: #027a48;
  border: 1px solid #abefc6;
}

.stockBadge--danger {
  background: #fef3f2;
  color: #b42318;
  border: 1px solid #fecdca;
}

.formCard {
  background: white;
  border: 1px solid rgba(31, 36, 48, 0.08);
  border-radius: 22px;
  padding: 20px;
}

.formGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
}

.field--full {
  grid-column: 1 / -1;
}

.label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #344054;
}

.input,
.textarea {
  width: 100%;
  border-radius: 14px;
  border: 1px solid #d8dadd;
  background: #fff;
  padding: 12px 14px;
  outline: none;
  font-size: 0.95rem;
  color: #1f2430;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.input:focus,
.textarea:focus {
  border-color: #e5971a;
  box-shadow: 0 0 0 4px rgba(229, 151, 26, 0.12);
}

.textarea {
  min-height: 180px;
  resize: vertical;
  line-height: 1.5;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 18px;
}

.btn {
  height: 46px;
  padding: 0 18px;
  border-radius: 16px;
  border: 1px solid rgba(31, 36, 48, 0.1);
  background: white;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  color: #1f2430;
  transition: 0.2s ease;
}

.btn--ghost:hover {
  background: #f8fafc;
}

.btn--primary {
  background: #e5971a;
  color: white;
  border-color: transparent;
  box-shadow: 0 10px 24px rgba(229, 151, 26, 0.22);
}

.btn--primary:hover {
  background: #d8890d;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.formCard {
  background: white;
  border: 1px solid rgba(31, 36, 48, 0.08);
  border-radius: 22px;
  padding: 24px;
  box-sizing: border-box;
}

.input,
.textarea {
  width: 100%;
  box-sizing: border-box;
}

.formGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  padding-top: 6px;
}

.field--full {
  grid-column: 1 / -1;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .previewCard {
    position: static;
  }
}

@media (max-width: 700px) {
  .modal {
    padding: 12px;
  }

  .modal__panel {
    padding: 16px;
    border-radius: 20px;
  }

  .modal__title {
    font-size: 1.55rem;
  }

  .formGrid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>