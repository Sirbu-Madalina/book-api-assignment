<script setup lang="ts">
import { computed } from "vue";
import { PhHeartStraight } from "@phosphor-icons/vue";
import type { Book } from "../services/books";

const props = defineProps<{
  book: Book;
}>();

const emit = defineEmits<{
  (e: "toggle-favorite", book: Book): void;
}>();

const progressPercent = computed(() => {
  if (!props.book.totalPages || props.book.totalPages <= 0) return 0;
  const current = props.book.currentPage ?? 0;
  return Math.min(100, Math.round((current / props.book.totalPages) * 100));
});

const statusLabel = computed(() => {
  switch (props.book.status) {
    case "want-to-read":
      return "Want to Read";
    case "currently-reading":
      return "Currently Reading";
    case "finished":
      return "Finished";
    default:
      return props.book.status;
  }
});
</script>

<template>
  <article class="book-card">
    <div class="book-cover-wrap">
      <img :src="book.coverImage" :alt="book.title" class="book-cover" />

      <button
        class="save-btn"
        :class="{ active: book.isFavorite }"
        type="button"
        @click="$emit('toggle-favorite', book)"
        aria-label="Toggle favorite"
      >
        <PhHeartStraight :size="18" :weight="book.isFavorite ? 'fill' : 'regular'" />
      </button>
    </div>

    <div class="book-content">
      <p class="book-genre">{{ book.genre }}</p>
      <h3 class="book-title">{{ book.title }}</h3>
      <p class="book-author">{{ book.author }}</p>

      <div class="status-row">
        <span class="status-badge">{{ statusLabel }}</span>
        <span class="progress-text">{{ book.currentPage }} / {{ book.totalPages }} pages</span>
      </div>

      <div class="progress">
        <div class="progress__bar" :style="{ width: `${progressPercent}%` }"></div>
      </div>

      <p v-if="book.targetDate" class="target-date">
        Target: {{ new Date(book.targetDate).toLocaleDateString() }}
      </p>
    </div>
  </article>
</template>

<style scoped>
.book-card {
  display: grid;
  gap: 14px;
  background: #fff;
  border: 1px solid rgba(31, 36, 48, 0.08);
  border-radius: 20px;
  overflow: hidden;
  transition: 0.2s ease;
}

.book-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
}

.book-cover-wrap {
  position: relative;
  aspect-ratio: 4 / 5;
  background: #f4f1eb;
}

.book-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.save-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  height: 42px;
  width: 42px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #344054;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.1);
}

.save-btn.active {
  color: #c1121f;
}

.book-content {
  display: grid;
  gap: 10px;
  padding: 0 16px 16px;
}

.book-genre {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  color: #8a6f45;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.book-title {
  margin: 0;
  font-size: 1.15rem;
  line-height: 1.3;
  color: #1f2430;
}

.book-author {
  margin: 0;
  color: #667085;
  font-size: 0.95rem;
}

.status-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.status-badge {
  padding: 0.32rem 0.6rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  background: #f2f4f7;
  color: #344054;
}

.progress-text {
  font-size: 0.82rem;
  color: #667085;
}

.progress {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #eaecf0;
  overflow: hidden;
}

.progress__bar {
  height: 100%;
  background: #e5971a;
}

.target-date {
  margin: 0;
  font-size: 0.82rem;
  color: #667085;
}
</style>