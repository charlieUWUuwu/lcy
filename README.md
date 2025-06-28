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

### 首次建立功能分支前，請依循下列流程進行：

1. Pull origin/develop 最新版本
   ```shell
   git pull origin develop
   ```
2. 以功能設計分支名(後面以 <YOUR_BRANCH_NAME> 稱呼)
   ```shell
   <YOUR_BRANCH_NAME> = <類型>/<功能名稱，用 kebab-case 表示>

   # 例如 feat/connect-user-api
   ```
     - 常見類型前綴
       - `feat/` ： 新增功能
       - `fix/` ： 修 bug
       - `refactor/` ： 重構、不影響功能
       - `chore/` ： 非功能性改動（與開發流程相關，如 CI 設定、更新套件等）
       - `style/` : 格式排版、空白、縮排、註解修正，不涉及邏輯變更
       - `docs/` : 文件相關修改，如 README、API 文件更新
3. 在 local 新增 branch 並切換過去
   ```shell
   git checkout -b <YOUR_BRANCH_NAME>
   ```
4. 在遠端建立自己維護的 branch
   ```shell
   git push -u origin <YOUR_BRANCH_NAME>
   ```

### 繼續增修內容，請依循下列流程進行：

1. 拉取分支的最新進度，並切回自己的分支
    ```bash
    git checkout develop
    git pull origin develop
    git checkout <YOUR_BRANCH_NAME>
    git pull origin <YOUR_BRANCH_NAME>
    ```
2. 將 develop 最新進度套用到自己的分支
    ```bash
    git merge develop
    ```
3. (opt)若有衝突請依序修復
4. 開始開發與提交
    ```bash
    # (前端)編輯後格式化與檢查
    npm run format-and-lint

    # 加入變更並 commit
    git add .
    git commit -m "feat: your message"
    ```
5. push 前再次做 merge 獲取 develop 最新進度，確保 PR 為最新狀態
    ```bash
    git checkout develop
    git pull origin develop
    git checkout <YOUR_BRANCH_NAME>
    git merge develop # 此步驟可能遇到衝突，記得解決
    ```
6. 將你的分支 push 到遠端
    ```bash
    git push origin <YOUR_BRANCH_NAME>
    ```
7. 前往 GitHub 發送 Pull Request
     - 從 <YOUR_BRANCH_NAME> 合併到 develop
     - 確保 PR 中能看到正確的變更內容與 commit 歷史
     - 請相關 reviewer 協助進行 Code Review
8. PR 成功合併後
     - 點選刪除分支按鈕，將 <YOUR_BRANCH_NAME> 刪除
     - 下次新的開發回到前面步驟: [首次建立功能分支前](###首次建立功能分支前，請依循下列流程進行：)

### 注意事項
- ❗ 請勿直接在 `develop` 分支開發，請務必開啟自己的功能分支進行作業
- ❗ 除非有特別需求，請避免使用 `git push -f` 強制推送，可能會覆蓋他人變更