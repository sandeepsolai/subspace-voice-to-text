import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useDeepgram } from './useDeepgram';
import { FaMicrophone, FaStop, FaMagic, FaTrash, FaCog, FaTimes, FaCopy, FaCheck, FaExclamationTriangle, FaExternalLinkAlt, FaSignOutAlt } from 'react-icons/fa';
import './App.css';

function App() {
  // Load saved key
  const savedKey = localStorage.getItem("deepgram_key");
  const [apiKey, setApiKey] = useState(savedKey || "");
  
  // Show settings if NO key is saved
  const [showSettings, setShowSettings] = useState(!savedKey);
  
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("Ready");
  const [copied, setCopied] = useState(false);

  const appWindow = getCurrentWindow();

  // 1. SAVE KEY
  const handleSaveKey = () => {
    if(!apiKey.trim()) {
        alert("⚠️ You cannot use the app without an API Key.");
        return;
    }
    localStorage.setItem("deepgram_key", apiKey);
    setStatus("Key Saved! ✅");
    setTimeout(() => {
        setShowSettings(false);
        setStatus("Ready");
    }, 500);
  };

  // 2. NEW: REMOVE KEY (For testing "Action Required")
  const handleRemoveKey = () => {
    if(confirm("Are you sure you want to remove your API Key?")) {
        localStorage.removeItem("deepgram_key");
        setApiKey("");
        alert("Key removed. App reset.");
        // Force refresh to reset state cleanly
        window.location.reload();
    }
  };

  const handleTranscript = (text) => {
    setTranscript((prev) => prev ? prev + " " + text : text);
  };
  
  const { isRecording, startRecording, stopRecording } = useDeepgram(apiKey, handleTranscript);

  const openLink = (url) => {
    invoke('open_browser', { url });
  };

  const handleMicClick = () => {
    if (!apiKey) {
      alert("⚠️ API Key Missing!\nPlease enter your Deepgram Key to start.");
      setShowSettings(true);
      return;
    }

    if (isRecording) {
      setStatus("Processing...");
      stopRecording();
    } else {
      setStatus("Listening...");
      startRecording();
    }
  };

  const handleManualCopy = async () => {
    if(!transcript) return;
    try {
        await navigator.clipboard.writeText(transcript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    } catch (err) {
        console.error('Failed to copy!', err);
        setStatus("Copy Failed ❌");
    }
  };

  const handleInsert = async () => {
    if (!transcript) return;
    setStatus("Inserting...");
    await invoke('type_text', { text: transcript });
    setTimeout(() => setStatus("Ready"), 500);
  };

  // Helper to check if we actually have a saved key (for UI logic)
  const isKeySaved = !!localStorage.getItem("deepgram_key");

  return (
    <div className="app-container">
      {/* Title Bar */}
      <div className="title-bar" onMouseDown={() => appWindow.startDragging()}>
        <div className="title-drag-area">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="title-text">Subspace Voice-to-Text</span>
        </div>
        <div className="window-controls">
           <button className="nav-btn" onClick={() => setShowSettings(true)}><FaCog /></button>
           <button className="nav-btn close" onClick={() => appWindow.close()}><FaTimes /></button>
        </div>
      </div>

      {showSettings ? (
        /* SETTINGS SCREEN */
        <div className="settings-screen">
          
          {/* DYNAMIC HEADER: Only show warning if key is missing */}
          {!isKeySaved ? (
             <>
               <FaExclamationTriangle size={40} color="#ffbd2e" style={{marginBottom: '10px'}} />
               <h2>Action Required</h2>
               <p>This app requires a Deepgram API Key.</p>
             </>
          ) : (
             <>
               <FaCog size={40} color="#3b82f6" style={{marginBottom: '10px'}} />
               <h2>Settings</h2>
               <p>Update your configuration below.</p>
             </>
          )}
          
          <input 
            type="password" 
            placeholder="Paste your API Key here..." 
            onChange={(e) => setApiKey(e.target.value)}
            value={apiKey}
            className="key-input"
          />
          
          <button className="save-btn" onClick={handleSaveKey}>
            {isKeySaved ? "Update Key" : "Save & Activate"}
          </button>
          
          {/* NEW: REMOVE KEY BUTTON */}
          {isKeySaved && (
              <button className="remove-btn" onClick={handleRemoveKey} style={{marginTop: '15px', background: 'none', border: '1px solid #444', color: '#ff5f56'}}>
                  <FaSignOutAlt style={{marginRight: '5px'}}/> Remove Key & Reset
              </button>
          )}

          {!isKeySaved && (
            <div style={{marginTop: '25px', padding: '10px', background: '#252525', borderRadius: '8px'}}>
                <p className="tiny-text" style={{marginBottom: '5px'}}>Don't have a key?</p>
                <button className="link-btn" onClick={() => openLink('https://console.deepgram.com/signup')}>
                    Get a Free Key <FaExternalLinkAlt size={10} style={{marginLeft: '5px'}}/>
                </button>
            </div>
          )}

          {/* Close Settings Button (Only if key exists, otherwise forced open) */}
          {isKeySaved && (
             <button className="link-btn" style={{marginTop: '20px', color: '#888'}} onClick={() => setShowSettings(false)}>
                 Cancel
             </button>
          )}
        </div>
      ) : (
        /* MAIN SCREEN */
        <div className="main-content">
          <div className="transcript-container">
            <div className="transcript-area">
                {transcript || <div className="placeholder">Ready to listen...</div>}
            </div>
            <button className="copy-overlay" onClick={handleManualCopy} title="Copy to Clipboard">
                {copied ? <FaCheck color="#4ade80"/> : <FaCopy />}
            </button>
          </div>

          <div className="status-bar">
            {isRecording && <span className="pulse-dot"></span>}
            {status}
          </div>

          <div className="controls">
            <button className="icon-btn" onClick={() => setTranscript("")} title="Clear">
                <FaTrash />
            </button>
            
            <button 
              className={`mic-btn ${isRecording ? 'recording' : ''}`}
              onMouseDown={handleMicClick}
              onMouseUp={() => isRecording && handleMicClick()} 
            >
              {isRecording ? <FaStop /> : <FaMicrophone />}
            </button>

            <button className="icon-btn primary" onClick={handleInsert} title="Magic Insert">
                <FaMagic />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;