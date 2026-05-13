<script setup lang="ts">
defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <textarea
    :value="modelValue"
    :placeholder="placeholder"
    class="min-h-24 w-full rounded border border-[var(--vscode-input-border)] bg-[var(--vscode-input-background)] px-3 py-2 text-sm text-[var(--vscode-input-foreground)] placeholder:text-[var(--vscode-input-placeholderForeground)] focus:outline focus:outline-1 focus:outline-[var(--vscode-focusBorder)]"
    @input="
      $emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)
    "
  />
</template>
