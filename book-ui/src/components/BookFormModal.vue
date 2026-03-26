<script setup lang="ts">
import { computed } from "vue";
import { PhX } from "@phosphor-icons/vue";
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
    <div class="modal" role="dialog" aria-modal="true" :aria-label="modalTitle">
      <div class="modal__header">
        <h2 class="modal__title">{{ modalTitle }}</h2>

        <button
          class="close-btn"
          type="button"
          @click="$emit('close')"
          aria-label="Close modal"
        >
          <PhX :size="24" weight="regular" />
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

          <label class="field">
            <span class="field__label">
              Deadline
              <span class="field__hint">(optional)</span>
            </span>
            <input v-model="model.targetDate" type="date" />
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
  background: rgba(15, 23, 42, 0.34);
  backdrop-filter: blur(4px);
}

.modal {
  width: min(720px, 100%);
  background: #fcfaf7;
  border-radius: 28px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
  overflow: hidden;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 28px 8px;
}

.modal__title {
  margin: 0;
  line-height: 1.02;
  color: #1f2430;
  font-family: ui-serif, Georgia, Cambria, serif;
  letter-spacing: -0.04em;
}

.close-btn {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: #667085;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
  flex-shrink: 0;
}

.close-btn:hover {
  background: rgba(31, 36, 48, 0.05);
  color: #1f2430;
}

.modal__body {
  padding: 14px 28px 10px;
}

.form-grid {
  display: grid;
  gap: 18px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.field {
  display: grid;
  gap: 8px;
}

.field__label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #344054;
}

.field__hint {
  font-weight: 400;
  color: #98a2b3;
  margin-left: 4px;
}

input,
select {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid rgba(31, 36, 48, 0.12);
  border-radius: 16px;
  background: #fff;
  padding: 15px 18px;
  font: inherit;
  font-size: 1rem;
  color: #1f2430;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input::placeholder {
  color: #98a2b3;
}

input:focus,
select:focus {
  border-color: rgba(126, 151, 118, 0.65);
  box-shadow: 0 0 0 4px rgba(126, 151, 118, 0.12);
}

.error {
  margin: 18px 0 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: #fef3f2;
  border: 1px solid #fecdca;
  color: #b42318;
  font-size: 0.92rem;
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  padding: 18px 28px 28px;
}

.btn {
  min-width: 120px;
  height: 52px;
  padding: 0 22px;
  border-radius: 16px;
  border: 1px solid rgba(31, 36, 48, 0.12);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
}

.btn--ghost {
  background: #fff;
  color: #344054;
}

.btn--ghost:hover {
  background: #f7f4ef;
}

.btn--primary {
  background: #8aa17f;
  color: #fff;
  border-color: transparent;
}

.btn--primary:hover {
  background: #7a9270;
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
    border-radius: 22px;
  }

  .modal__header {
    padding: 22px 18px 8px;
  }

  .modal__body {
    padding: 12px 18px 10px;
  }

  .modal__footer {
    padding: 16px 18px 18px;
    flex-direction: column-reverse;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .btn {
    width: 100%;
  }
}
</style>