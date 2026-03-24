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
    totalPages: 1,
    currentPage: 0,
    status: "want-to-read",
    targetDate: "",
    isFavorite: false,
  }),
});

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    error?: string;
    mode?: "add" | "edit";
  }>(),
  {
    mode: "add",
  }
);

defineEmits<{
  (e: "submit"): void;
  (e: "close"): void;
}>();

const statusOptions: { value: ReadingStatus; label: string }[] = [
  { value: "want-to-read", label: "Want to Read" },
  { value: "currently-reading", label: "Currently Reading" },
  { value: "finished", label: "Finished" },
];

const modalTitle = computed(() =>
  props.mode === "edit" ? "Edit Book" : "Add a New Book"
);

const submitLabel = computed(() =>
  props.mode === "edit" ? "Save Changes" : "Add Book"
);
</script>

<template>
  <div v-if="open" class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal__header">
        <h2 class="modal__title">{{ modalTitle }}</h2>

        <button
          class="close-btn"
          type="button"
          @click="$emit('close')"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>

      <div class="modal__body">
        <div class="form-grid">
          <label class="field">
            <span class="field__label">Title</span>
            <input
              v-model="model.title"
              type="text"
              placeholder="Enter book title"
            />
          </label>

          <label class="field">
            <span class="field__label">Author</span>
            <input
              v-model="model.author"
              type="text"
              placeholder="Enter author name"
            />
          </label>

          <label class="field">
            <span class="field__label">Cover image URL</span>
            <input
              v-model="model.coverImage"
              type="text"
              placeholder="Paste image URL..."
            />
          </label>

          <div class="form-row">
            <label class="field">
              <span class="field__label">Total Pages</span>
              <input
                v-model.number="model.totalPages"
                type="number"
                min="1"
                placeholder="e.g. 350"
              />
            </label>

            <label class="field">
              <span class="field__label">Status</span>
              <select v-model="model.status">
                <option
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </label>
          </div>

          <label class="checkbox-row">
            <input v-model="model.isFavorite" type="checkbox" />
            <span>Mark as favorite</span>
          </label>
        </div>

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
          {{ props.loading ? "Saving..." : submitLabel }}
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
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
}

.modal {
  width: min(560px, 100%);
  background: #fcfaf7;
  border: 1px solid rgba(31, 36, 48, 0.12);
  border-radius: 22px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.2);
  overflow: hidden;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 22px 16px;
  border-bottom: 1px solid rgba(31, 36, 48, 0.08);
}

.modal__title {
  margin: 0;
  font-size: 2rem;
  line-height: 1.08;
  color: #1f2430;
  font-family: ui-serif, Georgia, Cambria, serif;
  letter-spacing: -0.03em;
}

.close-btn {
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
}

.close-btn:hover {
  background: #f4efe8;
}

.modal__body {
  padding: 20px 22px 10px;
}

.form-grid {
  display: grid;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

input,
select {
  width: 100%;
  min-width: 0;
  border: 1px solid rgba(31, 36, 48, 0.12);
  border-radius: 14px;
  background: white;
  padding: 13px 14px;
  font: inherit;
  color: #1f2430;
  outline: none;
  box-sizing: border-box;
}

input::placeholder {
  color: #98a2b3;
}

input:focus,
select:focus {
  border-color: rgba(126, 151, 118, 0.65);
  box-shadow: 0 0 0 4px rgba(126, 151, 118, 0.12);
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #344054;
}

.checkbox-row input {
  width: 18px;
  height: 18px;
  accent-color: #7e9776;
}

.error {
  margin: 18px 0 0;
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
}

.btn--ghost {
  background: white;
  color: #344054;
}

.btn--ghost:hover {
  background: #f4efe8;
}

.btn--primary {
  background: #7e9776;
  color: white;
  border-color: transparent;
}

.btn--primary:hover {
  background: #6e8966;
}

.btn--primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 700px) {
  .overlay {
    padding: 12px;
  }

  .modal {
    width: 100%;
    border-radius: 18px;
  }

  .modal__header,
  .modal__body,
  .modal__footer {
    padding-left: 16px;
    padding-right: 16px;
  }

  .modal__title {
    font-size: 1.6rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal__footer {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>