# Lcy 膜壓預測系統

## Required Environment

- Node.js v22.14.0
- Recommended VSCode Extensions:
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - Linting support
  - [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig) - Code style consistency
  - [Simple React Snippets](https://marketplace.visualstudio.com/items?itemName=burkeholland.simple-react-snippets)
  - [ES7+ React/Redux/React-Native snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)

## Development

- Clone this repo
  ```shell
  git clone https://github.com/charlieUWUuwu/lcy.git
  ```
- Install the dependencies
  ```shell
  npm install
  ```
- Start the development server and launch Electron
  ```shell
  # This command starts the Vite development server on port 3000 and launches the Electron app for testing.
  npm run dev
  ```
- Package the project
  ```shell
  npm run build
  ```
- Generate an installer (`.exe` for Windows, `.dmg` for macOS).
  - ⚠ Note: On Windows, you may need to run this command in **Administrator mode** to avoid permission issues.
    ```shell
    npm run package
    ```

## How to maintain this repo

每次增修內容前請依循下列流程進行：

1. Pull origin/develop 最新版本
   ```shell
   git pull origin develop
   ```
2. 在 local 新增 branch 並切換
   ```shell
   git checkout -b <NEW_BRANCH_NAME>
   ```
3. 編輯完成後，格式化並檢查程式碼
   ```shell
   npm run format-and-lint
   ```
4. 沒問題的話，進行 commit
   ```shell
   git add .
   git commit -m "COMMIT_MSG"
   ```
5. 回到 develop 再次獲取 origin/develop 的最新版本、與自己的修正合併並修正出現的 conflict
   ```shell
   git checkout develop
   git pull
   git checkout <NEW_BRANCH_NAME>
   git rebase develop
   ```
6. 將新 branch 的修正與 develop 合併並 push 到 Github
   ```shell
   git checkout develop
   git merge <NEW_BRANCH_NAME>
   git push
   ```
