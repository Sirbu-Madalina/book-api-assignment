<script setup lang="ts">
import { ref } from "vue";
import { login, register } from "../services/auth";
import { useRouter } from "vue-router";

const router = useRouter();

const mode = ref<"login" | "register">("login");
const name = ref("");
const email = ref("");
const password = ref("");

const error = ref("");
const loading = ref(false);

async function submit() {
  error.value = "";
  loading.value = true;

  try {
    if (mode.value === "register") {
      await register(name.value, email.value, password.value);
      // after register, switch to login
      mode.value = "login";
    } else {
      await login(email.value, password.value);
      router.push("/");
    }
  } catch (e: any) {
    error.value = e.message || "Something went wrong";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="card">
    <h2>{{ mode === "login" ? "Login" : "Register" }}</h2>

    <form @submit.prevent="submit" class="form">
      <label v-if="mode === 'register'">
        Name
        <input v-model="name" required minlength="6" />
      </label>

      <label>
        Email
        <input v-model="email" required type="email" />
      </label>

      <label>
        Password
        <input v-model="password" required type="password" minlength="6" />
      </label>

      <p v-if="error" class="error">{{ error }}</p>

      <button class="btn" :disabled="loading">
        {{ loading ? "..." : mode === "login" ? "Login" : "Create account" }}
      </button>

      <button type="button" class="link" @click="mode = mode === 'login' ? 'register' : 'login'">
        {{ mode === "login" ? "Need an account? Register" : "Have an account? Login" }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.card { max-width: 420px; margin: 0 auto; padding: 16px; border: 1px solid #2b2b2b; border-radius: 12px; }
.form { display: grid; gap: 12px; }
label { display:grid; gap:6px; }
input { padding: 10px; border-radius: 8px; border: 1px solid #444; background: transparent; color: inherit; }
.btn { padding: 10px; border-radius: 10px; border: 1px solid #444; background: #1f6feb; color: white; cursor:pointer; }
.link { background: transparent; border: none; color: #7aa7ff; cursor:pointer; text-align:left; padding: 0; }
.error { color: #ff6b6b; }
</style>