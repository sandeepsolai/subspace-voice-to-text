import { useState, useRef, useCallback } from 'react';

export const useDeepgram = (apiKey, onTranscript) => {
    const [isRecording, setIsRecording] = useState(false);
    const socketRef = useRef(null);
    const mediaRecorderRef = useRef(null);

    const startRecording = useCallback(async () => {
        if (!apiKey) {
            alert("Please go to Settings ⚙️ and enter your API Key first.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Connect to Deepgram
            const socket = new WebSocket('wss://api.deepgram.com/v1/listen?punctuate=true&smart_format=true&model=nova-2', [
                'token',
                apiKey, 
            ]);

            socketRef.current = socket;

            // HANDLE CONNECTION ERRORS (e.g., No Internet)
            socket.onerror = (error) => {
                console.error("WebSocket Error:", error);
                alert("Connection Failed! ❌\nCheck your internet or API Key.");
                setIsRecording(false);
            };

            socket.onclose = () => {
                setIsRecording(false);
            };

            socket.onopen = () => {
                mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                mediaRecorderRef.current.addEventListener('dataavailable', event => {
                    if (event.data.size > 0 && socket.readyState === 1) {
                        socket.send(event.data);
                    }
                });
                mediaRecorderRef.current.start(250);
                setIsRecording(true);
            };

            socket.onmessage = (message) => {
                const received = JSON.parse(message.data);
                const transcript = received.channel?.alternatives[0]?.transcript;
                if (transcript && received.is_final) {
                    onTranscript(transcript);
                }
            };

        } catch (error) {
            console.error("Mic Error:", error);
            alert("Microphone Error 🎤\nEnsure permission is granted.");
        }
    }, [apiKey, onTranscript]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (socketRef.current && socketRef.current.readyState === 1) {
            socketRef.current.close();
        }
        setIsRecording(false);
    }, []);

    return { isRecording, startRecording, stopRecording };
};