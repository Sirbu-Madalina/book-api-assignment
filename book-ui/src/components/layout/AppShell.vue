<template>
  <div class="shell">
    <aside class="shell__sidebar">
      <slot name="sidebar" />
    </aside>

    <div class="shell__main">
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
  min-width: 0;
  overflow: hidden;
}

.shell__content {
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 34px 36px 48px;
  min-width: 0;
}
</style>
