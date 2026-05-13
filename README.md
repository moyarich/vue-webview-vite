# Build a VS Code Webview with Vue, Vite, Tailwind CSS, and VS Code-Themed Components

This tutorial shows how to create a VS Code extension that opens a custom webview powered by:

- **Vue** for the webview UI
- **Vite** for fast frontend builds
- **Tailwind CSS** for layout and custom styling
- **VS Code CSS theme variables** for native-looking controls
- **VS Code Webview API** for rendering the UI inside VS Code

---

## 1. Prerequisites

Install Node.js and npm first.

Then install the VS Code extension generator:

```bash
npm install --global yo generator-code
```

You should also have VS Code installed.

---

## 2. Create the VS Code Extension

Run:

```bash
yo code
```

Choose these options:

```text
✔ What type of extension do you want to create? New Extension (TypeScript)
✔ What's the name of your extension? vue-webview-vite
✔ What's the identifier of your extension? vue-webview-vite
✔ What's the description of your extension? webview
✔ Initialize a git repository? Yes
✔ Which bundler to use? unbundled
✔ Which package manager to use? npm
```

This creates the extension shell where the important files are:

```text
vue-webview-vite/
  package.json
  src/
    extension.ts
  tsconfig.json
```

Update the extension root `tsconfig.json` so the extension compiler only reads files from `src/` and does not accidentally compile the Vite Vue app inside `webview-ui`.

```json
{
  "compilerOptions": {
    "module": "Node16",
    "target": "ES2022",
    "outDir": "out",
    "lib": ["ES2022"],
    "sourceMap": true,
    "rootDir": "src",
    "strict": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "webview-ui", "out"]
}
```

The important part is:

```json
"include": ["src/**/*.ts"],
"exclude": ["node_modules", "webview-ui", "out"]
```

Without `include`, TypeScript may use the default pattern `**/*`, which can accidentally compile the Vite Vue app inside `webview-ui`.

---

## 3. Run the Extension for the First Time

Open the generated extension in VS Code and click on `src/extension.ts`.

Press:

```text
F5
```

This starts the extension in a new window called the **Extension Development Host**.

In that new window:

1. Open the Command Palette:
   - **Windows:** `Ctrl + Shift + P`
   - **macOS:** `Cmd + Shift + P`

2. Run:

```text
Hello World
```

You should see the default extension message:

```text
Hello World from vue-webview-vite!
```

This confirms that the extension host works before adding Vue.

---

## 4. Add a Vue App with Vite

From the extension root, run the command below to create a Vue + TypeScript app inside a folder named `webview-ui`:

```bash
npm create vite@latest webview-ui
```

Choose these options:

```text
✔ Select a framework? Vue
✔ Select a variant? TypeScript
```

Install the webview app dependencies:

```bash
cd webview-ui
npm install
```

Your project should now look like this:

```text
vue-webview-vite/
  src/
    extension.ts
  webview-ui/
    index.html
    package.json
    src/
      App.vue
      main.ts
      style.css
    vite.config.ts
```

---

## 5. Install Tailwind CSS for Vite

Make sure you are inside `webview-ui`:

```bash
cd webview-ui
```

Install Tailwind using the Vite plugin:

```bash
npm install tailwindcss @tailwindcss/vite
```

Update `webview-ui/vite.config.ts`:

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});
```

Update `webview-ui/src/style.css`:

```css
@import "tailwindcss";

:root {
  font-family: var(--vscode-font-family);
  color: var(--vscode-foreground);
  background: var(--vscode-editor-background);
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background: var(--vscode-editor-background);
  color: var(--vscode-foreground);
}

button,
input,
textarea,
select {
  font-family: inherit;
}
```

This setup keeps Tailwind available while still respecting VS Code theme variables.

---

## 6. Create VS Code-Themed Vue Components

- Build regular Vue components.
- Style them with Tailwind.
- Use VS Code CSS variables such as `--vscode-button-background`, `--vscode-input-background`, and `--vscode-panel-border`.

Create `webview-ui/src/components/VSCodeButton.vue`:

```vue
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
```

Create `webview-ui/src/components/VSCodeTextField.vue`:

```vue
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
  <input
    :value="modelValue"
    :placeholder="placeholder"
    class="w-full rounded border border-[var(--vscode-input-border)] bg-[var(--vscode-input-background)] px-3 py-2 text-sm text-[var(--vscode-input-foreground)] placeholder:text-[var(--vscode-input-placeholderForeground)] focus:outline focus:outline-1 focus:outline-[var(--vscode-focusBorder)]"
    @input="
      $emit('update:modelValue', ($event.target as HTMLInputElement).value)
    "
  />
</template>
```

Create `webview-ui/src/components/VSCodeTextArea.vue`:

```vue
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
```

Create `webview-ui/src/components/VSCodeCard.vue`:

```vue
<template>
  <section
    class="rounded-xl border border-[var(--vscode-panel-border)] bg-[var(--vscode-sideBar-background)] p-5 shadow-sm"
  >
    <slot />
  </section>
</template>
```

The UI combines Tailwind utility classes with VS Code CSS variables such as:

```text
var(--vscode-editor-background)
var(--vscode-foreground)
var(--vscode-descriptionForeground)
var(--vscode-panel-border)
var(--vscode-button-background)
var(--vscode-input-background)
```

That keeps the webview aligned with the active VS Code theme.

---

## 7. Create the Vue Webview UI with VS Code API Messaging

Create the Vue webview UI with VS Code message passing included from the start.

A webview runs like a small web app, but it cannot directly call the VS Code extension API. Instead, the Vue app sends messages to the extension, and the extension runs VS Code APIs on its behalf.

The flow looks like this:

```text
Vue button click
  → webview postMessage
  → extension receives message
  → extension runs VS Code API
  → extension sends response back to Vue
  → Vue updates the UI
```

### Create the VS Code API wrapper

Create `webview-ui/src/api/vscode-api.ts`:

```ts
export type WebviewMessage =
  | {
      type: "saveSettings";
      payload: {
        projectName: string;
        format: string;
        notes: string;
      };
    }
  | {
      type: "showInfo";
      payload: {
        message: string;
      };
    };

let vscodeApi: VSCodeApi | undefined;

function getVsCodeApi() {
  if (vscodeApi) {
    return vscodeApi;
  }

  if (typeof acquireVsCodeApi === "function") {
    vscodeApi = acquireVsCodeApi();
    return vscodeApi;
  }

  return undefined;
}

export function postMessage(message: WebviewMessage) {
  const vscode = getVsCodeApi();

  if (!vscode) {
    console.log("VS Code API is not available. Message was not sent:", message);
    return;
  }

  vscode.postMessage(message);
}

export function getVsCodeState<T>() {
  const vscode = getVsCodeApi();
  return vscode?.getState<T>();
}

export function setVsCodeState<T>(state: T) {
  const vscode = getVsCodeApi();
  vscode?.setState(state);
}
```

This wrapper is the only place where the Vue app should call `acquireVsCodeApi()`.

The wrapper calls `acquireVsCodeApi()` lazily, only when the app needs to communicate with VS Code. This prevents the app from crashing during Vite browser development or testing.

### Add webview API types for the wrapper

Create `webview-ui/src/vscode.d.ts`:

```ts
type VSCodeApi = {
  postMessage: (message: unknown) => void;
  getState: <T = unknown>() => T | undefined;
  setState: <T = unknown>(state: T) => void;
};

declare function acquireVsCodeApi(): VSCodeApi;
```

VS Code provides `acquireVsCodeApi()` inside the webview, but TypeScript does not know about it by default. This file adds the type information needed by `webview-ui/src/api/vscode-api.ts`.

The wrapper checks `typeof acquireVsCodeApi === "function"` because the function only exists inside VS Code, not when previewing the Vue app in a normal browser.

### Create `webview-ui/src/components/Webview.vue`

Create `webview-ui/src/components/Webview.vue`:

```vue
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
```

### How the interaction works

The Vue webview sends this message when the user clicks **Save settings**:

```ts
postMessage({
  type: "saveSettings",
  payload: {
    projectName: projectName.value,
    format: format.value,
    notes: notes.value,
  },
});
```

The extension receives that message, runs extension-side logic, and sends a response back to Vue.

The Vue webview receives extension messages here:

```ts
window.addEventListener("message", handleMessage);
```

---

## 8. Make `App.vue` Render `Webview.vue`

Keep `App.vue` small. Its job is to load the main webview component.

Create/Edit `webview-ui/src/App.vue`:

```vue
<script setup lang="ts">
import Webview from "./components/Webview.vue";
</script>

<template>
  <Webview />
</template>
```

This keeps the main webview logic inside `components/Webview.vue`, while `App.vue` stays as the Vue app entry component.

---

## 9. Build the Vue App

From inside `webview-ui`, run:

```bash
npm run build
```

Vite creates:

```text
webview-ui/dist/
  index.html
  assets/
    index.js
    index.css
```

The extension will load these built files into the webview.

---

## 10. Add the Webview Command to `package.json`

Open the extension root `package.json`.

Update `contributes.commands`:

```json
{
  "contributes": {
    "commands": [
      {
        "command": "vue-webview-vite.openPanel",
        "title": "Open Vue Webview"
      }
    ]
  }
}
```

Make sure the command name matches the command registered in `extension.ts`.

---

## 11. Create the Webview Panel in `extension.ts`

Replace `src/extension.ts` with:

```ts
import * as vscode from "vscode";

type WebviewMessage =
  | {
      type: "saveSettings";
      payload: {
        projectName: string;
        format: string;
        notes: string;
      };
    }
  | {
      type: "showInfo";
      payload: {
        message: string;
      };
    };

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "vue-webview-vite.openPanel",
    () => {
      const panel = vscode.window.createWebviewPanel(
        "vueWebviewVite",
        "Vue Webview",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, "webview-ui", "dist"),
          ],
        },
      );

      panel.webview.html = getWebviewHtml(panel.webview, context.extensionUri);

      panel.webview.onDidReceiveMessage(
        async (message: WebviewMessage) => {
          switch (message.type) {
            case "saveSettings": {
              await context.globalState.update(
                "vueWebviewVite.settings",
                message.payload,
              );

              vscode.window.showInformationMessage(
                `Saved settings for ${message.payload.projectName}`,
              );

              panel.webview.postMessage({
                type: "settingsSaved",
                payload: {
                  savedAt: new Date().toLocaleTimeString(),
                },
              });

              break;
            }

            case "showInfo": {
              vscode.window.showInformationMessage(message.payload.message);

              panel.webview.postMessage({
                type: "fromExtension",
                payload: {
                  message:
                    "VS Code received the message and showed a notification.",
                },
              });

              break;
            }
          }
        },
        undefined,
        context.subscriptions,
      );
    },
  );

  context.subscriptions.push(disposable);
}

function getWebviewHtml(webview: vscode.Webview, extensionUri: vscode.Uri) {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(
      extensionUri,
      "webview-ui",
      "dist",
      "assets",
      "index.js",
    ),
  );

  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(
      extensionUri,
      "webview-ui",
      "dist",
      "assets",
      "index.css",
    ),
  );

  const nonce = getNonce();

  return /* html */ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta
          http-equiv="Content-Security-Policy"
          content="default-src 'none'; img-src ${webview.cspSource} https:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';"
        />

        <link rel="stylesheet" href="${styleUri}" />
        <title>Vue Webview</title>
      </head>
      <body>
        <div id="app"></div>
        <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
      </body>
    </html>
  `;
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

export function deactivate() {}
```

Important details:

- `enableScripts: true` allows the Vue bundle to run.
- `localResourceRoots` allows the webview to read files from `webview-ui/dist`.
- `webview.asWebviewUri(...)` converts extension file paths into safe webview URLs.
- `context.extensionUri` points to the extension root folder, not the `out/` folder.
- The compiled extension runs from `out/extension.js`, but it can still reference `webview-ui/dist/assets/index.js` relative to the extension root.
- The CSP uses a `nonce` so only the intended script can run.

---

## 12. Run Both Development Watchers

From your terminal, make sure you are in the extension root folder:

```bash
cd vue-webview-vite
```

For development, run the extension's TypeScript watcher and the Vite webview watcher at the same time.

You need both because they build different parts of the project:

```text
Extension watcher → compiles src/extension.ts into out/extension.js
Webview watcher   → builds Vue/Tailwind files into webview-ui/dist/
```

Use `concurrently` because both watcher commands are long-running processes.

From the extension root, install it:

```bash
npm install -D concurrently
```

Add these scripts to the extension root `package.json`:

```json
{
  "scripts": {
    "watch": "tsc -watch -p ./",
    "watch:webview": "npm --prefix webview-ui run build -- --watch",
    "dev": "concurrently \"npm run watch\" \"npm run watch:webview\""
  }
}
```

Now start both watchers from the extension root:

```bash
npm run dev
```

This keeps both outputs updated while you work:

```text
out/extension.js
webview-ui/dist/assets/index.js
webview-ui/dist/assets/index.css
```

---

## 13. Start and Reload the Extension

To start the extension:

1. Open the extension project in VS Code.
2. Press `F5`.
3. A new **Extension Development Host** window opens.
4. Open the Command Palette.
5. Run:

```text
Open Vue Webview
```

The Vue webview should appear.

### Reloading after changes

There are two common reload flows.

#### If you changed Vue code

1. Keep `npm run dev` running from the extension root.
2. Close the webview panel.
3. Run `Open Vue Webview` again.

Usually you do not need to restart the full Extension Development Host for Vue-only changes.

#### If you changed extension code

If you changed `src/extension.ts` or `package.json`:

1. Go to the Extension Development Host window.
2. Press:

```text
Ctrl + R
```

On macOS, use:

```text
Cmd + R
```

This reloads the Extension Development Host.

Then run:

```text
Open Vue Webview
```

again from the Command Palette.

---

## 14. Production Build

Before packaging or publishing the extension, build both parts:

```bash
npm run compile
npm --prefix webview-ui run build
```

You should commit or package the built webview assets depending on your publishing workflow.

---

## 15. Quick Checks

Before running the extension, confirm these files exist:

```text
out/extension.js
webview-ui/dist/assets/index.js
webview-ui/dist/assets/index.css
```

Also confirm the command ID matches in both places:

```text
package.json → contributes.commands[].command
src/extension.ts → vscode.commands.registerCommand(...)
```

If the webview is blank, open VS Code Developer Tools with:

```text
Developer: Toggle Developer Tools
```

---

## 16. Final Folder Structure

```text
vue-webview-vite/
  package.json
  tsconfig.json
  src/
    extension.ts
  out/
    extension.js
    extension.js.map
  webview-ui/
    package.json
    vite.config.ts
    index.html
    src/
      App.vue
      main.ts
      style.css
      vscode.d.ts
      api/
        vscode-api.ts
      components/
        Webview.vue
        VSCodeButton.vue
        VSCodeCard.vue
        VSCodeTextArea.vue
        VSCodeTextField.vue
    dist/
      assets/
        index.js
        index.css
```

---

## Summary

You now have a VS Code extension that:

- Registers a command in the Command Palette
- Opens a custom webview panel
- Loads a Vue app built by Vite
- Uses Tailwind CSS for layout and styling
- Uses small reusable Vue components styled with VS Code theme variables
- Sends messages from the Vue webview to the VS Code extension
- Sends messages from the extension back to the Vue webview
- Supports a practical reload workflow during development

The key development loop is:

```bash
npm run dev
```

Then:

```text
F5 → Open Vue Webview → edit Vue → close/reopen panel → edit extension → Ctrl/Cmd + R
```
