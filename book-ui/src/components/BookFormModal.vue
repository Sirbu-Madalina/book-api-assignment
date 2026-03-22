<script setup lang="ts">
import { computed } from "vue";
import type { CreateBookInput, ReadingStatus } from "../services/books";

const open = defineModel<boolean>("open", { default: false });
const model = defineModel<CreateBookInput>({
  default: () => ({
    title: "",
    author: "",
    coverImage: "",
    description: "",
    genre: "",
    totalPages: 1,
    currentPage: 0,
    status: "want-to-read",
    targetDate: "",
    isFavorite: false,
  }),
});

const props = defineProps<{
  loading?: boolean;
  error?: string;
}>();

defineEmits<{
  (e: "submit"): void;
  (e: "close"): void;
}>();

const statusOptions: { value: ReadingStatus; label: string }[] = [
  { value: "want-to-read", label: "Want to Read" },
  { value: "currently-reading", label: "Currently Reading" },
  { value: "finished", label: "Finished" },
];

const coverPreview = computed(() => {
  return model.value.coverImage?.trim() || "";
});
</script>

<template>
  <div v-if="open" class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal__header">
        <div>
          <h2 class="modal__title">Add Book</h2>
          <p class="modal__subtitle">
            Add a new book to your reading tracker and keep your progress organized.
          </p>
        </div>

        <button class="close-btn" type="button" @click="$emit('close')" aria-label="Close modal">
          ✕
        </button>
      </div>

      <div class="modal__body">
        <section class="section">
          <div class="section__label">Book details</div>

          <div class="form-grid">
            <label class="field field--full">
              <span class="field__label">Title</span>
              <input
                v-model="model.title"
                type="text"
                placeholder="e.g. Atomic Habits"
              />
            </label>

            <label class="field field--full">
              <span class="field__label">Author</span>
              <input
                v-model="model.author"
                type="text"
                placeholder="e.g. James Clear"
              />
            </label>

            <label class="field field--full">
              <span class="field__label">Cover image URL</span>
              <input
                v-model="model.coverImage"
                type="text"
                placeholder="Paste an image URL..."
              />
            </label>

            <div v-if="coverPreview" class="cover-preview field--full">
              <img :src="coverPreview" alt="Book cover preview" class="cover-preview__img" />
              <div class="cover-preview__text">
                <span class="cover-preview__title">Cover preview</span>
                <span class="cover-preview__hint">This is how the book cover will appear.</span>
              </div>
            </div>

            <label class="field">
              <span class="field__label">Genre</span>
              <input
                v-model="model.genre"
                type="text"
                placeholder="e.g. Self-help"
              />
            </label>

            <label class="field">
              <span class="field__label">Status</span>
              <select v-model="model.status">
                <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>

            <label class="field field--full">
              <span class="field__label">Description</span>
              <textarea
                v-model="model.description"
                rows="4"
                placeholder="Write a short description or note about the book..."
              />
            </label>
          </div>
        </section>

        <section class="section">
          <div class="section__label">Reading progress</div>

          <div class="form-grid">
            <label class="field">
              <span class="field__label">Total pages</span>
              <input
                v-model.number="model.totalPages"
                type="number"
                min="1"
                placeholder="320"
              />
            </label>

            <label class="field">
              <span class="field__label">Current page</span>
              <input
                v-model.number="model.currentPage"
                type="number"
                min="0"
                placeholder="0"
              />
            </label>

            <label class="field">
              <span class="field__label">Target date</span>
              <input v-model="model.targetDate" type="date" />
            </label>

            <label class="field field--checkbox">
              <input v-model="model.isFavorite" type="checkbox" />
              <div>
                <span class="field__label field__label--checkbox">Mark as favorite</span>
                <p class="field__hint">Show this book in your favorites list.</p>
              </div>
            </label>
          </div>
        </section>

        <p v-if="props.error" class="error" role="alert">
          {{ props.error }}
        </p>
      </div>

      <div class="modal__footer">
        <button class="btn btn--ghost" type="button" @click="$emit('close')">
          Cancel
        </button>

        <button
          class="btn btn--primary"
          type="button"
          :disabled="props.loading"
          @click="$emit('submit')"
        >
          {{ props.loading ? "Saving..." : "Save Book" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  width: min(760px, 100%);
  max-height: min(88vh, 920px);
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: #fcfaf7;
  border: 1px solid rgba(31, 36, 48, 0.08);
  border-radius: 28px;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.22);
  overflow: hidden;
}

.modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 28px 18px;
  border-bottom: 1px solid rgba(31, 36, 48, 0.08);
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(252, 250, 247, 0.9));
}

.modal__title {
  margin: 0;
  font-size: 2rem;
  line-height: 1.1;
  color: #1f2430;
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  letter-spacing: -0.03em;
}

.modal__subtitle {
  margin: 8px 0 0;
  max-width: 520px;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #667085;
}

.close-btn {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(31, 36, 48, 0.08);
  border-radius: 999px;
  background: white;
  color: #344054;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.2s ease;
}

.close-btn:hover {
  background: #f4efe8;
  color: #1f2430;
}

.modal__body {
  overflow: auto;
  padding: 22px 28px 10px;
}

.section {
  display: grid;
  gap: 14px;
}

.section + .section {
  margin-top: 26px;
}

.section__label {
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #8a6f45;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
}

.field--full {
  grid-column: 1 / -1;
}

.field__label {
  font-size: 0.95rem;
  font-weight: 700;
  color: #344054;
}

.field__label--checkbox {
  display: block;
}

.field__hint {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: #667085;
}

input,
textarea,
select {
  width: 100%;
  min-width: 0;
  border: 1px solid rgba(31, 36, 48, 0.12);
  border-radius: 16px;
  background: white;
  padding: 14px 15px;
  font: inherit;
  color: #1f2430;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  box-sizing: border-box;
}

input::placeholder,
textarea::placeholder {
  color: #98a2b3;
}

input:focus,
textarea:focus,
select:focus {
  border-color: rgba(229, 151, 26, 0.65);
  box-shadow: 0 0 0 4px rgba(229, 151, 26, 0.12);
  background: #fffdfa;
}

textarea {
  resize: vertical;
  min-height: 110px;
}

.field--checkbox {
  grid-column: 1 / -1;
  grid-template-columns: 20px 1fr;
  align-items: start;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid rgba(31, 36, 48, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
}

.field--checkbox input {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: #e5971a;
}

.cover-preview {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(31, 36, 48, 0.08);
  background: rgba(255, 255, 255, 0.72);
}

.cover-preview__img {
  width: 64px;
  height: 88px;
  border-radius: 12px;
  object-fit: cover;
  background: #f2ede6;
  border: 1px solid rgba(31, 36, 48, 0.08);
}

.cover-preview__text {
  display: grid;
  gap: 4px;
}

.cover-preview__title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #344054;
}

.cover-preview__hint {
  font-size: 0.84rem;
  color: #667085;
}

.error {
  margin: 22px 0 0;
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
  padding: 18px 28px 24px;
  border-top: 1px solid rgba(31, 36, 48, 0.08);
  background: rgba(252, 250, 247, 0.95);
}

.btn {
  height: 46px;
  padding: 0 18px;
  border-radius: 14px;
  border: 1px solid rgba(31, 36, 48, 0.12);
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn--ghost {
  background: white;
  color: #344054;
}

.btn--ghost:hover {
  background: #f4efe8;
}

.btn--primary {
  background: #e5971a;
  color: white;
  border-color: transparent;
  box-shadow: 0 10px 24px rgba(229, 151, 26, 0.24);
}

.btn--primary:hover {
  background: #d88b12;
}

.btn--primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 700px) {
  .overlay {
    padding: 12px;
  }

  .modal {
    width: 100%;
    max-height: 92vh;
    border-radius: 22px;
  }

  .modal__header,
  .modal__body,
  .modal__footer {
    padding-left: 18px;
    padding-right: 18px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .row {
    grid-template-columns: 1fr;
  }

  .modal__title {
    font-size: 1.65rem;
  }

  .modal__footer {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>