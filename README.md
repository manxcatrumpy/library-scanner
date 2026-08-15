# 圖書借閱與自動建檔系統 (Library Management & Barcode Scanner System)

© 2026 淨靈工作室 (Jing Ling Studio). All Rights Reserved.

## 📝 專案簡介 (Project Overview)
本專案旨在開發一套輕量、高效的圖書管理與借閱系統。系統核心整合了前端網頁條碼掃描技術與外部圖書資料庫 (Google Books API)，實現「鏡頭掃描 ISBN ➔ 自動抓取書本中介資料 (Metadata) ➔ 快速建檔」的自動化流程，大幅降低傳統圖書管理的人工輸入成本。

## 🛠️ 技術選型與架構 (Tech Stack)

### 目前架構 (Phase 1: Frontend MVP)
*   **前端介面：** HTML5, CSS3, Vanilla JavaScript
*   **條碼辨識：** `html5-qrcode` (支援 EAN-13, EAN-8 格式，針對手機後置相機優化)
*   **資料來源：** Google Books API (`https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}`)
*   **部署環境：** GitHub Pages (HTTPS 環境以獲取相機權限)

### 未來架構規劃 (Phase 2: Backend & Infrastructure)
*   **前端框架：** 預計導入 Vue.js，並可考慮包裝為 Electron 桌面端應用程式以利館藏機台操作。
*   **後端 API：** Node.js (Express) 或 Python (FastAPI)。
*   **資料庫：** 關聯式資料庫 (PostgreSQL/MySQL) 儲存 `Users`, `Books`, `BorrowRecords`。
*   **部署配置：** Docker 容器化，可透過 Cloudflare Tunnels 進行本地端服務的安全穿透與對外發布。

---

## ✅ 目前開發進度 (Current Progress)

- [x] **專案初始化**：建立基礎 HTML 結構並成功部署至 GitHub Pages。
- [x] **掃描器核心實作**：整合 `html5-qrcode`，優化解析度 (720p+) 與相機參數 (強制使用 environment 後置鏡頭)。
- [x] **API 串接與資料解析**：實作非同步 `fetchBookInfo` 邏輯，成功解析 Google Books API 回傳之 JSON 資料 (書名、作者、封面圖片)。
- [x] **掃描與查詢整合**：完成「掃描 ➔ 查詢 ➔ 渲染 UI」的完整連貫流程。
- [x] **效能與體驗優化**：加入防抖 (Debounce) 機制 (`lastScannedIsbn`)，避免短時間內對同一條碼重複觸發 API 請求；新增讀取中狀態的 UI 提示。

---

## 🚀 下一步開發藍圖 (Next Steps & Roadmap)

### 1. 完善資料容錯機制 (Fallback & Manual Entry)
- [ ] **導入備用 API (Fallback)**：當 Google Books API 查無資料時（特別是部分台灣新出版之繁體中文書），自動退卻並呼叫 Open Library API 進行二次查詢。
- [ ] **手動建檔 UI**：當所有 API 皆無資料時，顯示手動輸入表單（書名、作者、出版年份），確保建檔流程不中斷。

### 2. UI/UX 現代化升級
- [ ] **導入 Tailwind CSS**：重構目前的 Inline/內部 CSS，建立更一致、響應式 (RWD) 的現代化卡片與掃描介面。
- [ ] **回饋音效**：在掃描成功與 API 查詢成功時，加入輕量的提示音效 (Beep)。

### 3. 後端與資料庫整合 (Backend Integration)
- [ ] **建立 Database Schema**：設計圖書狀態 (在館內/已借出) 與借閱歷程資料表。
- [ ] **實作 CRUD API**：將前端掃描並確認無誤的書籍資料，透過 `POST` 請求寫入自建資料庫。
- [ ] **借還書邏輯**：新增使用者身分識別機制，完成「借閱」與「歸還」的狀態切換。

---

## 💻 本地端開發指南 (Local Development Guide)

由於瀏覽器安全限制，存取本機攝影機需要處於 `localhost` 或 `HTTPS` 環境。

1. **Clone 專案：**
   ```bash
   git clone <your-repository-url>
   cd library-scanner
