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
    <!-- Left / Brand -->
    <section class="auth__brand" aria-label="Brand section">
      <div class="brand">
        <div class="brand__icon" aria-hidden="true">
          <!-- simple book icon (SVG) -->
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path
              d="M4.5 5.5C4.5 4.67157 5.17157 4 6 4h5c1.1046 0 2 .89543 2 2v14c0-1.1046-.8954-2-2-2H6c-.82843 0-1.5-.6716-1.5-1.5v-11Z"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M19.5 5.5C19.5 4.67157 18.8284 4 18 4h-5c-1.1046 0-2 .89543-2 2v14c0-1.1046.8954-2 2-2h5c.8284 0 1.5-.6716 1.5-1.5v-11Z"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <h1 class="brand__title">Your Personal Library</h1>
        <p class="brand__subtitle">
          Catalog, discover, and organize your book collection with <br />
          ease.
        </p>
      </div>
    </section>

    <!-- Right / Form -->
    <section class="auth__panel" aria-label="Authentication section">
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

        <form class="form" @submit.prevent="submit" novalidate>
          <div v-if="mode === 'register'" class="field">
            <label class="field__label" for="name">Name</label>
            <input
              id="name"
              v-model.trim="name"
              class="field__input"
              type="text"
              autocomplete="name"
              required
              minlength="2"
              placeholder="Your name"
            />
          </div>

          <div class="field">
            <label class="field__label" for="email">Email</label>
            <input
              id="email"
              v-model.trim="email"
              class="field__input"
              type="email"
              autocomplete="email"
              required
              placeholder="you@example.com"
            />
          </div>

          <div class="field">
            <label class="field__label" for="password">Password</label>
            <input
              id="password"
              v-model="password"
              class="field__input"
              type="password"
              autocomplete="current-password"
              required
              minlength="6"
              placeholder="••••••••"
            />
          </div>

          <p v-if="error" class="form__error" role="alert">
            {{ error }}
          </p>

          <button class="btn" type="submit" :disabled="loading">
            <span v-if="loading" class="spinner" aria-hidden="true"></span>
            {{
              loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : "Create account"
            }}
          </button>

          <p class="form__switch">
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
/* ===== Theme ===== */
.auth {
  --bg-left: #e9e2d8; /* warm beige */
  --bg-right: #f7f3ee; /* lighter beige */
  --text: #1f2430;
  --muted: #6b7280;
  --card: #f7f3ee;
  --border: rgba(31, 36, 48, 0.12);
  --input-bg: rgba(255, 255, 255, 0.55);
  --accent: #e5971a; /* orange button */
  --accent-hover: #d88b12;
  --danger: #b42318;

  min-height: 100dvh;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1.15fr 1fr;
}

/* ===== Left brand ===== */
.auth__brand {
  background: var(--bg-left);
  display: grid;
  place-items: center;
  padding: clamp(24px, 5vw, 72px);
}

.brand {
  text-align: center;
  max-width: 520px;
  padding: 8px;
}

.brand__icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 18px;
  display: grid;
  place-items: center;
  color: var(--accent);
}

.brand__title {
  margin: 0 0 10px;
  font-size: clamp(30px, 3.2vw, 44px);
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--text);
  font-weight: 700;
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
}

.brand__subtitle {
  margin: 0;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.7;
}

/* ===== Right panel ===== */
.auth__panel {
  background: var(--bg-right);
  display: grid;
  place-items: center;
  padding: clamp(24px, 4vw, 72px);
}

.panel {
  width: min(420px, 92vw);
}

.panel__head {
  margin-bottom: 20px;
}

.panel__title {
  margin: 0 0 8px;
  font-size: 32px;
  line-height: 1.1;
  color: var(--text);
  font-weight: 700;
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
}

.panel__desc {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
}

/* ===== Form ===== */
.form {
  display: grid;
  gap: 14px;
}

.field {
  display: grid;
  gap: 8px;
}

.field__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}

.field__input {
  height: 44px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  padding: 0 14px;
  color: var(--text);
  outline: none;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}

.field__input::placeholder {
  color: rgba(31, 36, 48, 0.45);
}

.field__input:focus {
  border-color: rgba(229, 151, 26, 0.55);
  box-shadow: 0 0 0 4px rgba(229, 151, 26, 0.18);
}

.form__error {
  margin: 2px 0 0;
  color: var(--danger);
  font-size: 13px;
}

/* Button */
.btn {
  height: 44px;
  border-radius: 12px;
  border: 0;
  background: var(--accent);
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.06s ease, background 0.15s ease, opacity 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 6px;
}

.btn:hover {
  background: var(--accent-hover);
}

.btn:active {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* tiny spinner */
.spinner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.55);
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Switch line */
.form__switch {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--muted);
  text-align: center;
}

.link {
  border: 0;
  background: transparent;
  color: var(--accent);
  font-weight: 700;
  cursor: pointer;
  padding: 0 0 0 6px;
}

.link:hover {
  text-decoration: underline;
}

/* ===== Responsive ===== */
@media (max-width: 900px) {
  .auth {
    grid-template-columns: 1fr;
  }
  .auth__brand {
    padding: 36px 22px;
  }
  .brand__subtitle br {
    display: none;
  }
}
</style>