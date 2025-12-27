# 🎙️ Subspace Voice-to-Text (Wispr Flow Clone)

A high-performance desktop application that brings AI-powered voice typing to any window on your computer. Built with Tauri, React, and Rust to replicate the core functionality of Wispr Flow.

## 🚀 Features
* **Real-time Transcription:** Powered by Deepgram's Nova-2 model for near-instant speech-to-text.
* **Magic Insert:** Automatically types transcribed text into the active window (Notepad, VS Code, Browser, etc.).
* **Cross-Platform Core:** Built on Tauri v2 for a lightweight, native experience.
* **Secure:** API Keys are stored locally on the device (LocalStorage) and never exposed.
* **System Integration:** Custom window chrome, always-on-top capabilities, and native OS keyboard simulation.

## 🛠️ Architecture & Design Decisions

### 1. Hybrid Architecture (Tauri)
I chose **Tauri** over Electron to ensure a smaller bundle size and better memory efficiency.
* **Frontend (React + Vite):** Handles the UI, state management, and the `MediaRecorder` API. I chose browser-native audio recording because it is more stable and permission-friendly than managing raw audio streams in Rust.
* **Backend (Rust):** Handles the "heavy lifting" that the browser cannot do—specifically, simulating global keyboard events to inject text into other applications.

### 2. Audio Pipeline
* **Stream:** Audio is captured using the browser's `navigator.mediaDevices` API.
* **Transport:** Data is streamed via **WebSockets** directly to Deepgram to ensure low-latency (real-time) feedback, rather than waiting for a full file upload.

### 3. Text Injection (The "Magic" Feature)
To solve the problem of "typing into another app," I used the **Enigo** crate in Rust.
* **Workflow:** When the user clicks "Insert," the Rust backend minimizes the Tauri window to return focus to the user's previous application, then simulates keystrokes to "paste" the text naturally.

## ⚠️ Assumptions & Known Limitations

### Assumptions
* **Operating System:** The current build and key-simulation logic are optimized for **Windows 10/11**.
* **Internet Access:** The app requires an active internet connection to reach Deepgram's API.
* **API Key:** The user must provide their own Deepgram API Key (entered via the Settings menu).

### Known Limitations
* **Focus Switching:** The "Magic Insert" feature relies on the OS correctly switching focus back to the previous window when the app minimizes. If the user clicks "Insert" without a background app open, text may not appear.
* **Text Speed:** Very long paragraphs may take a few seconds to "type out" completely due to the simulated keystroke delay (added to ensure compatibility with slower apps).

## 📥 How to Run Locally

### Prerequisites
* Node.js (v18+)
* Rust & Cargo (Latest Stable)
* C++ Build Tools (Windows)

### Installation
1.  Clone the repository:
    ```bash
    git clone [https://github.com/YOUR_USERNAME/subspace-voice-to-text.git](https://github.com/YOUR_USERNAME/subspace-voice-to-text.git)
    cd subspace-voice-to-text
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run in Development Mode:
    ```bash
    npm run tauri dev
    ```

### Build for Production
To create the optimized `.exe` installer:
```bash
npm run tauri build
