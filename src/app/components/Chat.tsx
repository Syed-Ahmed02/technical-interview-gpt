"use client"
import React from "react";
import { useEffect, useRef, useState, Component } from "react";

type ChatProps = {
    resumeData: File,
    jobDescription:string,
}

const Chat: React.FC<ChatProps> = ({resumeData,jobDescription}) => {
    const [status, setStatus] = useState("");
    const [isSessionActive, setIsSessionActive] = useState(Boolean);
    const audioIndicatorRef = useRef<HTMLDivElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioStreamRef = useRef<MediaStream | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    
    useEffect(() => {
        console.log("Chat",resumeData)
        return () => stopSession();
    }, []);


    const getVectorId = async () =>{
        console.log(resumeData)
        const res = await fetch("/api/openai/vectorstore",{
            method:"POST",
            body:JSON.stringify({file:resumeData}),
            headers:{
                'Content-Type':'application/json',
            }
        })
        const id = await res.json()
        return id
    }


    const getEmphemeralToken = async () => {
        const INSTRUCTIONS = `
                Your name is John, a behavioural interviewer at a company. I will give you a job description and a resume based on which you will ask me questions, 
                after each question you will provide me feedback. Start with asking me how my day is going.
                Here is the job description ${jobDescription}`

        const vectorStoreId = getVectorId();
        const res = await fetch("/api/openai/session", {
            method: "POST",
            body:JSON.stringify({instructions:INSTRUCTIONS, vectorStoreId:vectorStoreId}),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await res.json()
        return data.client_secret.value;
    }

    const startSession = async () => {
        try {
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
            peerConnectionRef.current = pc;
            
            setIsSessionActive(true)
            setStatus("Connection Established Successfully")
        } catch (err){
            console.error(err)
            setStatus(`An unknown error has occured`)
            stopSession();  
        }

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
            <button className="bg-white border rounded-lg border-white text-black w-fit mx-auto p-3" onClick={handleStartStop}>{isSessionActive ? "Stop Talking" : "Start Talking"}</button>
            {status}
        </div>
    )
}

export default Chat