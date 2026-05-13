<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import VSCodeButton from "./VSCodeButton.vue";
import VSCodeCard from "./VSCodeCard.vue";
import VSCodeTextArea from "./VSCodeTextArea.vue";
import VSCodeTextField from "./VSCodeTextField.vue";
import { getVsCodeState, postMessage, setVsCodeState } from "../api/vscode-api";

type AppState = {
  projectName: string;
  format: string;
  notes: string;
};

type ExtensionMessage =
  | {
      type: "settingsSaved";
      payload: {
        savedAt: string;
      };
    }
  | {
      type: "fromExtension";
      payload: {
        message: string;
      };
    };

const defaultState: AppState = {
  projectName: "Jupytext Pair Helper",
  format: "ipynb,py:percent",
  notes: "",
};

const savedState = getVsCodeState<AppState>();

const projectName = ref(savedState?.projectName ?? defaultState.projectName);
const format = ref(savedState?.format ?? defaultState.format);
const notes = ref(savedState?.notes ?? defaultState.notes);
const status = ref("Ready");

watch(
  [projectName, format, notes],
  () => {
    setVsCodeState({
      projectName: projectName.value,
      format: format.value,
      notes: notes.value,
    });
  },
  { immediate: true },
);

function saveSettings() {
  postMessage({
    type: "saveSettings",
    payload: {
      projectName: projectName.value,
      format: format.value,
      notes: notes.value,
    },
  });
}

function showInfoMessage() {
  postMessage({
    type: "showInfo",
    payload: {
      message: `Current project: ${projectName.value}`,
    },
  });
}

function resetSettings() {
  projectName.value = defaultState.projectName;
  format.value = defaultState.format;
  notes.value = defaultState.notes;
  status.value =
    "Reset locally. Click Save settings to send the update to VS Code.";
}

function handleMessage(event: MessageEvent<ExtensionMessage>) {
  const message = event.data;

  switch (message.type) {
    case "settingsSaved":
      status.value = `Settings saved at ${message.payload.savedAt}`;
      break;
    case "fromExtension":
      status.value = message.payload.message;
      break;
  }
}

onMounted(() => {
  window.addEventListener("message", handleMessage);
});

onUnmounted(() => {
  window.removeEventListener("message", handleMessage);
});
</script>

<template>
  <main class="min-h-screen p-5">
    <section class="mx-auto grid max-w-4xl gap-5">
      <VSCodeCard>
        <p
          class="text-xs uppercase tracking-wide text-[var(--vscode-descriptionForeground)]"
        >
          VS Code Webview Tutorial
        </p>
        <h1 class="mt-2 text-2xl font-semibold text-[var(--vscode-foreground)]">
          Vue + Vite + Tailwind + VS Code Message Passing
        </h1>
        <p
          class="mt-2 max-w-2xl text-sm leading-6 text-[var(--vscode-descriptionForeground)]"
        >
          This webview uses Vue for state, Tailwind for layout, and VS Code
          message passing to communicate with the extension.
        </p>
      </VSCodeCard>

      <div class="grid gap-5 md:grid-cols-2">
        <VSCodeCard>
          <h2 class="text-lg font-medium">Settings</h2>

          <div class="mt-4 grid gap-4">
            <label class="grid gap-1 text-sm">
              <span class="text-[var(--vscode-descriptionForeground)]"
                >Project name</span
              >
              <VSCodeTextField v-model="projectName" />
            </label>

            <label class="grid gap-1 text-sm">
              <span class="text-[var(--vscode-descriptionForeground)]"
                >Pairing format</span
              >
              <select
                v-model="format"
                class="w-full rounded border border-[var(--vscode-dropdown-border)] bg-[var(--vscode-dropdown-background)] px-3 py-2 text-sm text-[var(--vscode-dropdown-foreground)] focus:outline focus:outline-1 focus:outline-[var(--vscode-focusBorder)]"
              >
                <option value="ipynb,py:percent">Python percent pair</option>
                <option value="ipynb,md:myst">Markdown MyST pair</option>
                <option value="ipynb,md,pct.py:percent">
                  Notebook + Markdown + percent script
                </option>
              </select>
            </label>

            <label class="grid gap-1 text-sm">
              <span class="text-[var(--vscode-descriptionForeground)]"
                >Notes</span
              >
              <VSCodeTextArea
                v-model="notes"
                placeholder="Notes about the selected pairing format..."
              />
            </label>

            <div class="flex flex-wrap gap-2">
              <VSCodeButton @click="saveSettings">Save settings</VSCodeButton>
              <VSCodeButton @click="showInfoMessage"
                >Show VS Code message</VSCodeButton
              >
              <VSCodeButton variant="secondary" @click="resetSettings"
                >Reset</VSCodeButton
              >
            </div>
          </div>
        </VSCodeCard>

        <VSCodeCard>
          <h2 class="text-lg font-medium">Preview</h2>

          <div class="mt-4 grid gap-4">
            <div
              class="rounded-lg border border-[var(--vscode-panel-border)] p-4"
            >
              <p class="text-sm text-[var(--vscode-descriptionForeground)]">
                Project
              </p>
              <h3 class="mt-1 text-lg font-medium">{{ projectName }}</h3>
            </div>

            <div
              class="rounded-lg border border-[var(--vscode-panel-border)] p-4"
            >
              <p class="text-sm text-[var(--vscode-descriptionForeground)]">
                Selected Jupytext format
              </p>
              <code
                class="mt-2 block rounded bg-[var(--vscode-textCodeBlock-background)] p-3"
              >
                {{ format }}
              </code>
            </div>

            <div
              class="rounded-lg border border-[var(--vscode-panel-border)] p-4"
            >
              <p class="text-sm text-[var(--vscode-descriptionForeground)]">
                Status
              </p>
              <p class="mt-1 text-sm">{{ status }}</p>
            </div>
          </div>
        </VSCodeCard>
      </div>
    </section>
  </main>
</template>
