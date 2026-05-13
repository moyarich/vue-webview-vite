<script setup lang="ts">
const textValue = defineModel<string>({ required: true });

defineProps<{
  placeholder?: string;
}>();
</script>

<template>
  <textarea
    v-model="textValue"
    :placeholder="placeholder"
    class="min-h-24 w-full rounded border border-[var(--vscode-input-border)] bg-[var(--vscode-input-background)] px-3 py-2 text-sm text-[var(--vscode-input-foreground)] placeholder:text-[var(--vscode-input-placeholderForeground)] focus:outline focus:outline-1 focus:outline-[var(--vscode-focusBorder)]"
  />
</template>
