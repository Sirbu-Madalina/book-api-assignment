<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { requestPasswordReset } from "../services/auth";
import logoImg from "../assets/logo.png";

const email = ref("");
const error = ref("");
const message = ref("");
const loading = ref(false);

async function submit() {
  error.value = "";
  message.value = "";
  loading.value = true;

  try {
    const result = await requestPasswordReset(email.value);
    message.value =
      result?.message || "If that email exists, a password reset link has been created.";
  } catch (e: any) {
    error.value = e?.message || "Could not create a reset link.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="auth">
    <section class="auth__brand">
      <div class="brand">
        <img :src="logoImg" alt="PageTurn logo" class="brand__logo" />
        <h1 class="brand__title">Reset Your Password</h1>
        <p class="brand__subtitle">
          Enter your account email and PageTurn will create a secure reset link.
        </p>
      </div>
    </section>

    <section class="auth__panel">
      <div class="panel">
        <header class="panel__head">
          <h2 class="panel__title">Forgot password?</h2>
          <p class="panel__desc">Use the email connected to your PageTurn account.</p>
        </header>

        <form class="form" @submit.prevent="submit">
          <div class="field">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              required
            />
          </div>

          <p v-if="error" class="error">{{ error }}</p>
          <p v-if="message" class="success">{{ message }}</p>

          <button class="btn" type="submit" :disabled="loading">
            {{ loading ? "Creating link..." : "Send reset link" }}
          </button>

          <RouterLink class="back-link" to="/login">Back to sign in</RouterLink>
        </form>
      </div>
    </section>
  </main>
</template>

<style scoped>
.auth {
  --green: #7e9776;
  --bg-left: #e9e2d8;
  --bg-right: #f7f3ee;
  --text: #1f2430;
  --muted: #6b7280;

  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
}

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

.brand__title,
.panel__title {
  font-family: ui-serif, Georgia, serif;
}

.brand__title {
  font-size: 42px;
  margin-bottom: 10px;
}

.brand__subtitle,
.panel__desc {
  color: var(--muted);
}

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
}

.panel__desc {
  margin-bottom: 20px;
}

.form,
.field {
  display: grid;
}

.form {
  gap: 14px;
}

.field {
  gap: 6px;
}

input {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #ddd;
  padding: 0 12px;
  box-sizing: border-box;
  font: inherit;
}

input:focus {
  outline: none;
  border-color: var(--green);
  box-shadow: 0 0 0 3px rgba(126, 151, 118, 0.2);
}

.btn {
  height: 46px;
  border-radius: 12px;
  background: var(--green);
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.error,
.success,
.back-link {
  font-size: 13px;
}

.error {
  color: #b42318;
}

.success {
  color: #4f7f45;
}

.back-link {
  color: var(--green);
  font-weight: 600;
  text-align: center;
  text-decoration: none;
}

@media (max-width: 900px) {
  .auth {
    grid-template-columns: 1fr;
  }
}
</style>
