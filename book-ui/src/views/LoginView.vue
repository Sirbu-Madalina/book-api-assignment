<script setup lang="ts">
import { ref } from "vue";
import { login, register } from "../services/auth";
import { useRouter } from "vue-router";
import logoImg from "../assets/logo.png";

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
      mode.value = "login";
    } else {
      await login(email.value, password.value);
      router.push("/");
    }
  } catch (e: any) {
    error.value = e?.message || "Something went wrong";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="auth">
    <!-- Left -->
    <section class="auth__brand">
      <div class="brand">
        <img :src="logoImg" alt="PageTurn logo" class="brand__logo" />

        <h1 class="brand__title">Your Personal Library</h1>
        <p class="brand__subtitle">
          Catalog, discover, and organize your book collection with ease.
        </p>
      </div>
    </section>

    <!-- Right -->
    <section class="auth__panel">
      <div class="panel">
        <header class="panel__head">
          <h2 class="panel__title">
            {{ mode === "login" ? "Welcome back" : "Create your account" }}
          </h2>
          <p class="panel__desc">
            {{
              mode === "login"
                ? "Sign in to access your collection"
                : "Register to start building your collection"
            }}
          </p>
        </header>

        <form class="form" @submit.prevent="submit">
          <div v-if="mode === 'register'" class="field">
            <label for="name">Name</label>
            <input
              id="name"
              v-model="name"
              type="text"
              placeholder="Your name"
              autocomplete="name"
            />
          </div>

          <div class="field">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
            />
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>

          <p v-if="error" class="error">{{ error }}</p>

          <button class="btn" type="submit" :disabled="loading">
            {{
              loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : "Create account"
            }}
          </button>

          <p class="switch">
            <span v-if="mode === 'login'">Don't have an account?</span>
            <span v-else>Already have an account?</span>

            <button
              type="button"
              class="link"
              @click="mode = mode === 'login' ? 'register' : 'login'"
            >
              {{ mode === "login" ? "Create one" : "Sign in" }}
            </button>
          </p>
        </form>
      </div>
    </section>
  </main>
</template>

<style scoped>
.auth {
  --green: #7e9776;
  --green-soft: #dbe5d7;
  --bg-left: #e9e2d8;
  --bg-right: #f7f3ee;
  --text: #1f2430;
  --muted: #6b7280;

  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
}

/* LEFT */
.auth__brand {
  background: var(--bg-left);
  display: grid;
  place-items: center;
  padding: 60px;
}

.brand {
  text-align: center;
}

.brand__logo {
  width: 200px;
  margin-bottom: 16px;
}

.brand__title {
  font-size: 42px;
  font-family: ui-serif, Georgia, serif;
  margin-bottom: 10px;
}

.brand__subtitle {
  color: var(--muted);
}

/* RIGHT */
.auth__panel {
  background: var(--bg-right);
  display: grid;
  place-items: center;
}

.panel {
  width: 360px;
}

.panel__title {
  font-size: 32px;
  font-family: ui-serif, Georgia, serif;
}

.panel__desc {
  color: var(--muted);
  margin-bottom: 20px;
}

/* FORM */
.form {
  display: grid;
  gap: 14px;
}

.field {
  display: grid;
  gap: 6px;
}

input {
  height: 44px;
  border-radius: 12px;
  border: 1px solid #ddd;
  padding: 0 12px;
}

input:focus {
  outline: none;
  border-color: var(--green);
  box-shadow: 0 0 0 3px rgba(126, 151, 118, 0.2);
}

/* BUTTON */
.btn {
  height: 46px;
  border-radius: 12px;
  background: var(--green);
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.btn:hover {
  background: #6e8966;
}

/* TEXT */
.switch {
  text-align: center;
  font-size: 13px;
  color: var(--muted);
}

.link {
  background: none;
  border: none;
  color: var(--green);
  font-weight: 600;
  cursor: pointer;
}

/* ERROR */
.error {
  color: #b42318;
  font-size: 13px;
}

/* MOBILE */
@media (max-width: 900px) {
  .auth {
    grid-template-columns: 1fr;
  }
}
</style>
