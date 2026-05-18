<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { PhEye, PhEyeSlash } from "@phosphor-icons/vue";
import { resetPassword } from "../services/auth";
import logoImg from "../assets/logo.png";

const route = useRoute();
const router = useRouter();

const password = ref("");
const showPassword = ref(false);
const error = ref("");
const message = ref("");
const loading = ref(false);

const token = computed(() => String(route.query.token ?? ""));

async function submit() {
  error.value = "";
  message.value = "";

  if (!token.value) {
    error.value = "Password reset link is missing a token.";
    return;
  }

  loading.value = true;

  try {
    await resetPassword(token.value, password.value);
    message.value = "Password reset successfully. Redirecting to sign in...";
    setTimeout(() => router.push("/login"), 1200);
  } catch (e: any) {
    error.value = e?.message || "Could not reset password.";
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
        <h1 class="brand__title">Choose a New Password</h1>
        <p class="brand__subtitle">
          Keep it memorable, but not obvious.
        </p>
      </div>
    </section>

    <section class="auth__panel">
      <div class="panel">
        <header class="panel__head">
          <h2 class="panel__title">Reset password</h2>
          <p class="panel__desc">Enter your new PageTurn password.</p>
        </header>

        <form class="form" @submit.prevent="submit">
          <div class="field">
            <label for="password">New password</label>
            <div class="password-field">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="New password"
                autocomplete="new-password"
                required
              />
              <button
                class="password-toggle"
                type="button"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <PhEyeSlash v-if="showPassword" :size="22" weight="regular" />
                <PhEye v-else :size="22" weight="regular" />
              </button>
            </div>
          </div>

          <p v-if="error" class="error">{{ error }}</p>
          <p v-if="message" class="success">{{ message }}</p>

          <button class="btn" type="submit" :disabled="loading">
            {{ loading ? "Saving..." : "Reset password" }}
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

.password-field {
  position: relative;
}

.password-field input {
  padding-right: 48px;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 10px;
  width: 32px;
  height: 32px;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #7c7168;
  cursor: pointer;
}

.password-toggle:hover {
  background: rgba(126, 151, 118, 0.12);
  color: var(--green);
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
