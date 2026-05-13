<script setup lang="ts">
defineProps<{
  variant?: "primary" | "secondary";
}>();
</script>

<template>
  <button
    :class="[
      'rounded px-3 py-1.5 text-sm font-medium focus:outline focus:outline-1 focus:outline-[var(--vscode-focusBorder)]',
      variant === 'secondary'
        ? 'bg-[var(--vscode-button-secondaryBackground)] text-[var(--vscode-button-secondaryForeground)] hover:bg-[var(--vscode-button-secondaryHoverBackground)]'
        : 'bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)]',
    ]"
  >
    <slot />
  </button>
</template>
