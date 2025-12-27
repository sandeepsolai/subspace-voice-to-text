## 🚀 Download & Install
You can download the latest Windows installer from the [Releases Page](https://github.com/sandeepsolai/subspace-voice-to-text/releases/tag/v1.0.0).

## 🛠️ How to Run Locally (for Developers)
1. Clone the repo
2. `npm install`
3. `npm run tauri dev`


## 🏗️ Architecture & Decisions
* **Tech Stack:** Tauri (v2) + React + Rust.
* **Why Tauri?** Chosen over Electron for smaller bundle size and better performance on low-end devices.
* **Hybrid Audio Handling:**
  - **Frontend:** Handles audio recording via `MediaRecorder` API for simplicity and browser compatibility.
  - **Backend (Rust):** Handles system-level text injection using the `enigo` crate to simulate native keystrokes.
* **Security:** API Keys are stored in `localStorage` and never hardcoded. The app prompts the user if the key is missing.

## ⚠️ Known Limitations
* **Windows Only:** The text injection (`enigo`) is currently optimized for Windows.
* **Focus Switching:** The user must have a text field (like Notepad) active for the "Insert" feature to work correctly.
