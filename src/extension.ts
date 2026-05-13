// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
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

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "vue-webview-vite" is now active!',
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const helloWorlDisposable = vscode.commands.registerCommand(
    "vue-webview-vite.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage(
        "Hello World from vue-webview-vite!",
      );
    },
  );

  context.subscriptions.push(helloWorlDisposable);

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

// This method is called when your extension is deactivated
export function deactivate() {}
