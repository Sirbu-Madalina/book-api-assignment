import { ref, watch } from "vue";
import type { Book } from "../services/books";

const cartBooks = ref<Book[]>(loadCartFromStorage());

function loadCartFromStorage(): Book[] {
  const raw = localStorage.getItem("cartBooks");
  return raw ? JSON.parse(raw) : [];
}

watch(
  cartBooks,
  (value) => {
    localStorage.setItem("cartBooks", JSON.stringify(value));
  },
  { deep: true }
);

export function useCart() {
  function addToCart(book: Book) {
    const exists = cartBooks.value.some((b) => b._id === book._id);
    if (!exists) {
      cartBooks.value.push(book);
    }
  }

  function removeFromCart(id?: string) {
    if (!id) return;
    cartBooks.value = cartBooks.value.filter((b) => b._id !== id);
  }

  function clearCart() {
    cartBooks.value = [];
  }

  const cartCount = () => cartBooks.value.length;

  return {
    cartBooks,
    addToCart,
    removeFromCart,
    clearCart,
    cartCount,
  };
}