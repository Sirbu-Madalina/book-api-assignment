<script setup lang="ts">
import BookCard from "../components/BookCard.vue";
import { useSavedBooks } from "../composables/useSavedBooks";
import { useCart } from "../composables/useCart";

const { savedBooks, toggleSave, isSaved } = useSavedBooks();
const { addToCart } = useCart();
</script>

<template>
  <section class="page">
    <header class="hero">
      <h1 class="hero__title">Favorites</h1>
      <p class="hero__sub">{{ savedBooks.length }} saved book{{ savedBooks.length === 1 ? "" : "s" }}</p>
    </header>

    <div v-if="savedBooks.length" class="grid">
      <BookCard
        v-for="book in savedBooks"
        :key="book._id"
        :book="book"
        :saved="isSaved(book._id)"
        @add-to-cart="addToCart"
        @toggle-save="toggleSave"
      />
    </div>

    <div v-else class="empty">
      You have no saved books yet.
    </div>
  </section>
</template>

<style scoped>
.page {
  color: #1f2430;
}

.hero {
  padding: 8px 0 18px;
}

.hero__title {
  margin: 0;
  font-size: 46px;
  letter-spacing: -0.03em;
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
}

.hero__sub {
  margin: 6px 0 0;
  color: rgba(31, 36, 48, 0.62);
  font-size: 14px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 18px;
}

.empty {
  padding: 22px;
  border-radius: 16px;
  border: 1px dashed rgba(31, 36, 48, 0.12);
  color: rgba(31, 36, 48, 0.62);
}
</style>