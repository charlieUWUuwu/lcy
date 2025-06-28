# Lcy 膜壓預測系統

## Required Environment

- Node.js v22.14.0
- Recommended VSCode Extensions:
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - Linting support
  - [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig) - Code style consistency
  - [Simple React Snippets](https://marketplace.visualstudio.com/items?itemName=burkeholland.simple-react-snippets)
  - [ES7+ React/Redux/React-Native snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)

## Development(Frontend)

- Clone this repo
  ```shell
  git clone https://github.com/charlieUWUuwu/lcy.git
  ```
- Enter `/frontend`
  ```shell
  cd frontend
  ```
- Install the dependencies
  ```shell
  npm install
  ```
- Start the development server and launch Electron
  ```shell
  # This command starts the Vite development server and launches the Electron app for testing.
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

### 首次增修內容前，請依循下列流程進行：

1. Pull origin/develop 最新版本
   ```shell
   git pull origin develop
   ```
2. 在 local 新增 branch 並切換
   ```shell
   git checkout -b <YOUR_BRANCH_NAME>
   ```
3. 在遠端建立自己維護的 branch
   ```shell
   git push -u origin <YOUR_BRANCH_NAME>
   ```

### 繼續增修內容，請依循下列流程進行：
1. 拉取最新進度
    ```bash
    git checkout develop
    git pull origin develop
    git checkout <YOUR_BRANCH_NAME>
    git pull origin <YOUR_BRANCH_NAME>
    ```
2. 使用 rebase 將 develop 最新進度套用到自己的分支
    ```bash
    git rebase develop
    ```
3. (opt)若有衝突請依序修復後：
    ```bash
    git add .
    git rebase --continue
    ```
4. 開始開發與 commit
    ```bash
    # (前端)編輯後格式化與檢查
    npm run format-and-lint

    # 加入變更並 commit
    git add .
    git commit -m "feat: your message"
    ```
5. 上傳前或開發過程中同步最新的 develop 更新，可使用 merge
    ```bash
    git merge develop

    # 此步驟可能遇到衝突，記得解決
    ```
6. 將你的分支 push 到遠端
    ```bash
    git push origin <YOUR_BRANCH_NAME>
    ```
7. 前往 GitHub 發送 Pull Request
     - 從 <YOUR_BRANCH_NAME> 合併到 develop
     - 確保 PR 中能看到正確的變更內容與 commit 歷史
     - 請相關 reviewer 協助進行 Code Review