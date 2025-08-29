# Jable API

A simple API service to extract video information from Jable.tv using Browserless for bypassing Cloudflare protection.

[中文版本](#中文版本)

---

## Prerequisites

- Node.js
- [Browserless API key](https://www.browserless.io/)

## Installation

```bash
npm install
```

## Configuration

Set your Browserless API key in environment variable:

```bash
export BROWSERLESS_API_KEY=your-api-key-here
```

Or modify `config.js` directly.

## Usage

Start the server:

```bash
npm start
```

## API Endpoints

- `GET /` - API information
- `GET /api/health` - Health check
- `GET /api/test-browserless` - Test Browserless connection
- `GET /api/video/:videoCode` - Get video information

### Example

Request:
```bash
curl http://localhost:3000/api/video/pppe-356
```

Response:
```json
{
    "success": true,
    "data": {
        "videoCode": "pppe-356",
        "title": "暗戀比我小一輪、又超正的苗條巨乳繼妹到說她交了男友，我妒火中燒下了安眠藥，每晚都趁她昏睡無套中出幹她",
        "actress": [
            "楪可憐"
        ],
        "thumbnail": "https://assets-cdn.jable.tv/contents/videos_screenshots/52000/52882/preview.jpg",
        "duration": null,
        "views": null,
        "tags": [
            "中文字幕",
            "角色劇",
            "媚藥",
            "進犯",
            "凌辱",
            "巨乳",
            "中出",
            "少女",
            "凌辱快感",
            "催眠"
        ],
        "textInfo": "中文字幕",
        "description": "此作品曾在本站上傳，現已更新至中文字幕版。暗戀比我小一輪、又超正的苗條巨乳繼妹到說她交了男友，我妒火中燒下了安眠藥，每晚都趁她昏睡無套中出幹她",
        "url": "https://jable.tv/videos/pppe-356/"
    },
    "timestamp": "2025-08-29T08:20:49.236Z"
}
```

## Features

- Extracts video title, actress, tags, duration, and more
- Handles Cloudflare-protected content via Browserless
- Validates video existence after fetching content

## Note

This project requires Browserless due to Cloudflare protection on Jable.tv. Each request consumes Browserless API credits. The project is provided as-is for anyone who needs this functionality.

## License

MIT

---

## 中文版本

一個簡單的 API 服務，使用 Browserless 繞過 Cloudflare 保護來提取 Jable.tv 的影片資訊。

### 前置需求

- Node.js
- [Browserless API 金鑰](https://www.browserless.io/)

### 安裝

```bash
npm install
```

### 設定

在環境變數中設定你的 Browserless API 金鑰：

```bash
export BROWSERLESS_API_KEY=your-api-key-here
```

或直接修改 `config.js`。

### 使用方式

啟動伺服器：

```bash
npm start
```

### API 端點

- `GET /` - API 資訊
- `GET /api/health` - 健康檢查
- `GET /api/test-browserless` - 測試 Browserless 連線
- `GET /api/video/:videoCode` - 取得影片資訊

#### 範例

請求：
```bash
curl http://localhost:3000/api/video/pppe-356
```

回應：
```json
{
    "success": true,
    "data": {
        "videoCode": "pppe-356",
        "title": "暗戀比我小一輪、又超正的苗條巨乳繼妹到說她交了男友，我妒火中燒下了安眠藥，每晚都趁她昏睡無套中出幹她",
        "actress": [
            "楪可憐"
        ],
        "thumbnail": "https://assets-cdn.jable.tv/contents/videos_screenshots/52000/52882/preview.jpg",
        "duration": null,
        "views": null,
        "tags": [
            "中文字幕",
            "角色劇",
            "媚藥",
            "進犯",
            "凌辱",
            "巨乳",
            "中出",
            "少女",
            "凌辱快感",
            "催眠"
        ],
        "textInfo": "中文字幕",
        "description": "此作品曾在本站上傳，現已更新至中文字幕版。暗戀比我小一輪、又超正的苗條巨乳繼妹到說她交了男友，我妒火中燒下了安眠藥，每晚都趁她昏睡無套中出幹她",
        "url": "https://jable.tv/videos/pppe-356/"
    },
    "timestamp": "2025-08-29T08:20:49.236Z"
}
```

### 功能特點

- 提取影片標題、演員、標籤、時長等資訊
- 透過 Browserless 處理受 Cloudflare 保護的內容
- 擷取內容後驗證影片是否存在

### 備註

由於 Jable.tv 有 Cloudflare 保護，此專案需要使用 Browserless。每次請求都會消耗 Browserless API 額度。此專案以現狀提供給需要此功能的人使用。

### 授權

MIT