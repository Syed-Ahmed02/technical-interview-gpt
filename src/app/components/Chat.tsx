"use client"
import React from "react";
import { useEffect, useRef, useState, Component } from "react";


const Chat: React.FC = () => {
    const [status, setStatus] = useState("");
    const [isSessionActive, setIsSessionActive] = useState(Boolean);
    const audioIndicatorRef = useRef<HTMLDivElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioStreamRef = useRef<MediaStream | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        return () => stopSession();
    }, []);

    const getEmphemeralToken = async () => {
        const res = await fetch("/api/openai/session", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await res.json()
        return data.client_secret.value;
    }

    const startSession = async () => {
        setStatus("Requesting Microphone Access")
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        const ephemeralToken = await getEmphemeralToken()
        // Create a peer connection
        setStatus("Establishing Connection")
        const pc = new RTCPeerConnection();

        // Set up to play remote audio from the model
        const audioEl = document.createElement("audio");
        audioEl.autoplay = true;
        pc.ontrack = e => audioEl.srcObject = e.streams[0];

        // Add local audio track for microphone input in the browser
        const ms = await navigator.mediaDevices.getUserMedia({
            audio: true
        });
        pc.addTrack(ms.getTracks()[0]);

        // Set up data channel for sending and receiving events
        const dc = pc.createDataChannel("oai-events");
        dc.addEventListener("message", (e) => {
            // Realtime server events appear here!
            console.log(e);
        });

        // Start the session using the Session Description Protocol (SDP)
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const baseUrl = "https://api.openai.com/v1/realtime";
        const model = "gpt-4o-realtime-preview-2024-12-17";
        const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
            method: "POST",
            body: offer.sdp,
            headers: {
                Authorization: `Bearer ${ephemeralToken}`,
                "Content-Type": "application/sdp"
            },
        });

        const answer: RTCSessionDescriptionInit = {
            type: "answer",
            sdp: await sdpResponse.text(),
        };
        await pc.setRemoteDescription(answer);
    }
    const stopSession = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach((track) => track.stop());
            audioStreamRef.current = null;
        }

        if (audioIndicatorRef.current) {
            audioIndicatorRef.current.classList.remove("active");
        }

        setIsSessionActive(false);
        setStatus("");
    };

    const handleStartStop = () => {
        if (isSessionActive) {
            stopSession();
        } else {
            startSession();
        }
    }

    return (
        <div className="bg-gradient-to-br from-neutral-950 to-neutral-800 border border-red-200 rounded-lg p-8 drop-shadow-2xl flex flex-col space-y-2 w-96">
            <button className="bg-white border rounded-lg border-white text-black w-fit mx-auto p-3" onClick={handleStartStop}>Start Talking</button>
            {status}
        </div>
    )
}

export default Chat