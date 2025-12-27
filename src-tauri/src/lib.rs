use enigo::{Enigo, Settings, Keyboard};
use tauri::{AppHandle, Manager};
use std::{thread, time};

// COMMAND 1: Open URL in default browser
#[tauri::command]
fn open_browser(url: String) {
    let _ = open::that(url);
}

// COMMAND 2: Type text into the active window
#[tauri::command]
fn type_text(app: AppHandle, text: String) {
    // 1. Minimize the app window so we can type in the background app
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.minimize();
    }

    // 2. Wait a tiny bit for focus to switch, then type
    thread::spawn(move || {
        thread::sleep(time::Duration::from_millis(150));
        if let Ok(mut enigo) = Enigo::new(&Settings::default()) {
            let _ = enigo.text(&text);
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        // REGISTER BOTH COMMANDS HERE:
        .invoke_handler(tauri::generate_handler![type_text, open_browser]) 
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}