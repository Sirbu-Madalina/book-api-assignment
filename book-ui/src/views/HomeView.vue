<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Book } from "../services/books";
import { getBooks, createBook, deleteBook } from "../services/books";
import { isLoggedIn } from "../services/auth";

const books = ref<Book[]>([]);
const error = ref("");
const loading = ref(false);

const form = ref<Book>({
  title: "",
  author: "",
  image: "",
  description: "",
  publishedYear: new Date().getFullYear(),
  genre: "",
  price: 0,
  inStock: true,
});

async function load() {
  error.value = "";
  loading.value = true;
  try {
    books.value = await getBooks();
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

async function addBook() {
  if (!isLoggedIn()) {
    error.value = "Login first to create a book.";
    return;
  }

  try {
    const created = await createBook(form.value);
    books.value.unshift(created);
    form.value = {
      title: "",
      author: "",
      image: "",
      description: "",
      publishedYear: new Date().getFullYear(),
      genre: "",
      price: 0,
      inStock: true,
    };
  } catch (e: any) {
    error.value = e.message;
  }
}

async function removeBook(id?: string) {
  if (!id) return;
  try {
    await deleteBook(id);
    books.value = books.value.filter((b) => b._id !== id);
  } catch (e: any) {
    error.value = e.message;
  }
}

onMounted(load);
</script>

<template>
  <section class="grid">
    <div class="card">
      <h2>Create book</h2>

      <div class="form">
        <input v-model="form.title" placeholder="Title" />
        <input v-model="form.author" placeholder="Author" />
        <input v-model="form.image" placeholder="Image URL (optional)" />
        <input v-model="form.genre" placeholder="Genre" />
        <input v-model.number="form.publishedYear" type="number" placeholder="Published year" />
        <input v-model.number="form.price" type="number" placeholder="Price" />
        <textarea v-model="form.description" placeholder="Description"></textarea>

        <label class="row">
          <input v-model="form.inStock" type="checkbox" />
          In stock
        </label>

        <button class="btn" @click="addBook">Create</button>
        <p v-if="error" class="error">{{ error }}</p>
      </div>
    </div>

    <div class="card">
      <div class="row between">
        <h2>Books</h2>
        <button class="btn ghost" @click="load">Refresh</button>
      </div>

      <p v-if="loading">Loading...</p>

      <div class="list">
        <article v-for="b in books" :key="b._id" class="item">
          <img v-if="b.image" :src="b.image" alt="" class="thumb" />
          <div class="meta">
            <h3>{{ b.title }}</h3>
            <p class="muted">{{ b.author }} • {{ b.genre }} • {{ b.publishedYear }}</p>
            <p class="muted">€{{ b.price }} • {{ b.inStock ? "In stock" : "Out of stock" }}</p>
            <p>{{ b.description }}</p>
          </div>

          <button class="btn danger" @click="removeBook(b._id)">Delete</button>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.grid { display:grid; grid-template-columns: 1fr 1.3fr; gap: 16px; }
@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
.card { border: 1px solid #2b2b2b; border-radius: 12px; padding: 16px; }
.form { display:grid; gap: 10px; }
input, textarea { padding: 10px; border-radius: 8px; border: 1px solid #444; background: transparent; color: inherit; }
textarea { min-height: 100px; resize: vertical; }
.btn { padding: 10px 12px; border-radius: 10px; border: 1px solid #444; background: #1f6feb; color: white; cursor:pointer; }
.btn.ghost { background: transparent; color: inherit; }
.btn.danger { background: #b42318; border-color: #b42318; }
.row { display:flex; gap: 10px; align-items:center; }
.between { justify-content: space-between; }
.list { display:grid; gap: 12px; margin-top: 12px; }
.item { display:grid; grid-template-columns: 70px 1fr auto; gap: 12px; align-items:start; border: 1px solid #2b2b2b; border-radius: 12px; padding: 12px; }
.thumb { width: 70px; height: 70px; object-fit: cover; border-radius: 10px; border: 1px solid #333; }
.meta h3 { margin: 0; }
.muted { color: #aaa; margin: 2px 0; }
.error { color: #ff6b6b; margin-top: 8px; }
</style>