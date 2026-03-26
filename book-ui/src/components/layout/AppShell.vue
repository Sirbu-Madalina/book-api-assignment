<template>
  <div class="shell">
    <aside class="shell__sidebar">
      <slot name="sidebar" />
    </aside>

    <div class="shell__main">
      <header class="shell__topbar">
        <span>Your reading companion</span>
      </header>

      <main class="shell__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell {
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
}

.shell__sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background: rgba(255, 255, 255, 0.28);
  overflow: hidden;
}

.shell__main {
  margin-left: var(--sidebar-width);
  height: 100vh;
  display: grid;
  grid-template-rows: 56px 1fr;
  min-width: 0;
}

.shell__topbar {
  display: flex;
  align-items: center;
  padding: 0 24px;
  color: var(--text-soft);
  font-size: 0.9rem;
  background: var(--bg);
}

.shell__content {
  overflow-y: auto;
  padding: 38px 36px 48px;
  min-width: 0;
}
</style>