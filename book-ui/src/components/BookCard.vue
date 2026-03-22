<script setup lang="ts">
import { computed } from "vue";
import { PhHeartStraight, PhShoppingCartSimple } from "@phosphor-icons/vue";
import type { Book } from "../services/books";

const props = defineProps<{
  book: Book;
  saved?: boolean;
}>();

const emit = defineEmits<{
  (e: "add-to-cart", book: Book): void;
  (e: "toggle-save", book: Book): void;
}>();

const stockLabel = computed(() =>
  (props.book.stockQuantity || 0) > 0 ? "In stock" : "Out of stock"
);
</script>

<template>
  <article class="book-card">
    <div class="book-cover-wrap">
      <img :src="book.image" :alt="book.title" class="book-cover" />

      <button
        class="save-btn"
        :class="{ active: saved }"
        type="button"
        @click="$emit('toggle-save', book)"
        aria-label="Save book"
      >
        <PhHeartStraight :size="18" :weight="saved ? 'fill' : 'regular'" />
      </button>
    </div>

    <div class="book-content">
      <p class="book-genre">{{ book.genre }}</p>
      <h3 class="book-title">{{ book.title }}</h3>
      <p class="book-author">{{ book.author }}</p>

      <div class="book-meta">
        <span class="price">${{ Number(book.price).toFixed(2) }}</span>
        <span
          class="stock-badge"
          :class="(book.stockQuantity || 0) > 0 ? 'ok' : 'empty'"
        >
          {{ stockLabel }}
        </span>
      </div>

      <div class="book-actions">
        <button
          class="btn btn-primary"
          type="button"
          :disabled="(book.stockQuantity || 0) <= 0"
          @click="$emit('add-to-cart', book)"
        >
          <PhShoppingCartSimple :size="18" />
          Add to cart
        </button>
      </div>
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
  transition: 0.2s ease;
}

.save-btn:hover {
  transform: scale(1.05);
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

.book-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.price {
  font-size: 1rem;
  font-weight: 800;
  color: #1f2430;
}

.stock-badge {
  padding: 0.32rem 0.6rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.stock-badge.ok {
  background: #ecfdf3;
  color: #027a48;
}

.stock-badge.empty {
  background: #fef3f2;
  color: #b42318;
}

.book-actions {
  margin-top: 6px;
}

.btn {
  height: 44px;
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(31, 36, 48, 0.1);
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: 0.2s ease;
}

.btn-primary {
  background: #e5971a;
  color: white;
  border-color: transparent;
}

.btn-primary:hover {
  background: #d8890d;
}

.btn-primary:disabled {
  background: #e5e7eb;
  color: #98a2b3;
  cursor: not-allowed;
}
</style>