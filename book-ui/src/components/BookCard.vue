<script setup lang="ts">
import { computed } from "vue";
import {
  PhPencilSimple,
  PhTrash,
  PhArrowClockwise,
  PhPlus,
} from "@phosphor-icons/vue";
import type { Book } from "../services/books";

const props = defineProps<{
  book: Book;
}>();

const emit = defineEmits<{
  (e: "delete-book", book: Book): void;
  (e: "edit-book", book: Book): void;
  (e: "cycle-status", book: Book): void;
  (e: "add-time", book: Book): void;
}>();

const progressPercent = computed(() => {
  const total = props.book.totalPages ?? 0;
  const current = props.book.currentPage ?? 0;

  if (total <= 0) return 0;

  return Math.min(100, Math.round((current / total) * 100));
});

const statusLabel = computed(() => {
  if (props.book.status === "want-to-read") return "Want to read";
  if (props.book.status === "currently-reading") return "Currently reading";
  return "Finished";
});

const statusClass = computed(() => {
  if (props.book.status === "want-to-read") return "status-badge--want";
  if (props.book.status === "currently-reading") return "status-badge--reading";
  return "status-badge--finished";
});

const showDeadline = computed(() => {
  return props.book.status === "currently-reading" && !!props.book.targetDate;
});

const canAddTime = computed(() => {
  return props.book.status === "currently-reading";
});
</script>

<template>
  <article class="book-card">
    <img :src="book.coverImage" :alt="book.title" class="book-cover" />

    <div class="book-main">
      <div class="book-top">
        <div>
          <h3 class="book-title">{{ book.title }}</h3>
          <p class="book-author">{{ book.author }}</p>
        </div>

        <div class="top-actions">
          <button
            class="icon-btn"
            type="button"
            aria-label="Edit book"
            @click="$emit('edit-book', book)"
          >
            <PhPencilSimple :size="16" />
          </button>

          <button
            class="icon-btn icon-btn--danger"
            type="button"
            aria-label="Delete book"
            @click="$emit('delete-book', book)"
          >
            <PhTrash :size="16" />
          </button>
        </div>
      </div>

      <div class="status-row">
        <div class="status-group">
          <span class="status-badge" :class="statusClass">
            {{ statusLabel }}
          </span>

          <button
            class="switch-status-btn"
            type="button"
            @click="$emit('cycle-status', book)"
            aria-label="Change status"
          >
            <PhArrowClockwise :size="16" />
          </button>
        </div>

        <p v-if="showDeadline" class="deadline">
          Deadline: {{ new Date(book.targetDate!).toLocaleDateString() }}
        </p>
      </div>

      <div class="bottom-row">
        <div class="progress-section">
          <div class="progress-text-row">
            <span class="pages-text">
              Page: {{ book.currentPage ?? 0 }} / {{ book.totalPages }}
            </span>
          </div>

          <div class="progress">
            <div
              class="progress__bar"
              :style="{ width: `${progressPercent}%` }"
            ></div>
          </div>
        </div>

        <button
          class="add-time-btn"
          type="button"
          :disabled="!canAddTime"
          @click="$emit('add-time', book)"
        >
          <PhPlus :size="15" />
          Add time
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.book-card {
  display: grid;
  grid-template-columns: 112px 1fr;
  gap: 18px;
  align-items: start;
  padding: 18px;
  background: #fff;
  border: 1px solid rgba(31, 36, 48, 0.08);
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}

.book-cover {
  width: 112px;
  height: 154px;
  border-radius: 14px;
  object-fit: cover;
  display: block;
  background: #ece8e2;
}

.book-main {
  display: grid;
  gap: 16px;
  min-width: 0;
}

.book-top {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.book-title {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.15;
  color: #1f2430;
  font-weight: 700;
}

.book-author {
  margin: 6px 0 0;
  color: #7b7f86;
  font-size: 0.95rem;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: #a2762d;
  display: grid;
  place-items: center;
  cursor: pointer;
  border-radius: 8px;
}

.icon-btn:hover {
  background: #f5f1ea;
}

.icon-btn--danger {
  color: #ff6b5f;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.status-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  font-size: 0.84rem;
  font-weight: 500;
}

.status-badge--want {
  background: #f7efe2;
  color: #a2762d;
}

.status-badge--reading {
  background: #e5f1de;
  color: #6f9165;
}

.status-badge--finished {
  background: #d8efcf;
  color: #5f8b55;
}

.switch-status-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #9b7b3f;
  display: grid;
  place-items: center;
  cursor: pointer;
  border-radius: 999px;
}

.switch-status-btn:hover {
  background: #f5f1ea;
}

.deadline {
  margin: 0;
  color: #7b7f86;
  font-size: 0.86rem;
}

.bottom-row {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
}

.progress-section {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 8px;
}

.progress-text-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.pages-text {
  font-size: 0.82rem;
  color: #7b7f86;
}

.progress {
  width: 100%;
  height: 7px;
  border-radius: 999px;
  background: #ececec;
  overflow: hidden;
}

.progress__bar {
  height: 100%;
  background: #f0b400;
  border-radius: inherit;
}

.add-time-btn {
  height: 32px;
  padding: 0 8px;
  border: none;
  background: transparent;
  color: #a2762d;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 1px solid #a2762d;
}

.add-time-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  border-bottom-color: transparent;
}

@media (max-width: 760px) {
  .book-card {
    grid-template-columns: 88px 1fr;
    padding: 14px;
    gap: 14px;
  }

  .book-cover {
    width: 88px;
    height: 122px;
  }

  .bottom-row {
    flex-direction: column;
    align-items: stretch;
  }

  .add-time-btn {
    align-self: flex-start;
  }
}
</style>
