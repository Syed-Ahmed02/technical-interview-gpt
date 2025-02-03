"use client";
import React, { useEffect, useRef, useState } from "react";

type ChatProps = {
    resumeData: File;
    jobDescription: string;
};

type EventType = {
    type: string;
    data: any;
};

type Message = {
    role: 'assistant' | 'user';
    content: string;
};

const Chat: React.FC<ChatProps> = ({ resumeData, jobDescription }) => {
    const [status, setStatus] = useState("");
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const audioIndicatorRef = useRef<HTMLDivElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioStreamRef = useRef<MediaStream | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        return () => stopSession();
    }, []);

    const getEmphemeralToken = async () => {
        const INSTRUCTIONS = `
            Your name is John, a behavioural interviewer at a company. I will give you a job description and a resume based on which you will ask me questions, 
            after each question you will provide me feedback. Start by introducing yourself and ask how my day is going.
            Here is the job description ${jobDescription}`;

        const res = await fetch("/api/openai/session", {
            method: "POST",
            body: JSON.stringify({ instructions: INSTRUCTIONS, vectorStoreId: "" }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            throw new Error("Failed to fetch ephemeral token.");
        }

        const data = await res.json();
        return data.client_secret.value;
    };

    const startSession = async () => {
        try {
            setStatus("Requesting Microphone Access");
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch((err) => {
                throw new Error("Microphone access denied. Please allow microphone access to continue.");
            });
            audioStreamRef.current = stream;

            const ephemeralToken = await getEmphemeralToken().catch((err) => {
                throw new Error("Failed to fetch ephemeral token. Please try again.");
            });

            setStatus("Establishing Connection");
            const pc = new RTCPeerConnection();

            const audioEl = document.createElement("audio");
            audioEl.autoplay = true;
            pc.ontrack = e => audioEl.srcObject = e.streams[0];

            const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
            pc.addTrack(ms.getTracks()[0]);

            const dc = pc.createDataChannel("oai-events");
            dc.addEventListener("message", (e) => {
                // Realtime server events appear here!
                console.log(e);
            });

            setDataChannel(dc);

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            const baseUrl = "https://api.openai.com/v1/realtime";
            const model = "correct-model-name"; // Replace with the actual model name
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

            setIsSessionActive(true);
            setStatus("Connection Established Successfully");
        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                setStatus(err.message || "An unknown error has occurred");
            } else {
                setStatus("An unknown error has occurred");
            }
            stopSession();
        }
    };

    const stopSession = () => {
        if (dataChannel) {
            dataChannel.close();
            setDataChannel(null);
        }

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

    useEffect(() => {
        if (!dataChannel) return;

        const handleMessage = (e: MessageEvent) => {
            const event = JSON.parse(e.data);
            // Handle different types of events
            if (event.type === 'text') {
                // Assistant's message
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: event.data.text
                }]);
            } else if (event.type === 'transcript') {
                // User's transcribed message
                setMessages(prev => [...prev, {
                    role: 'user',
                    content: event.data.text
                }]);
            }
        };

        const handleOpen = () => {
            setIsSessionActive(true);
            setMessages([]);
        };

        dataChannel.addEventListener("message", handleMessage);
        dataChannel.addEventListener("open", handleOpen);

        return () => {
            dataChannel.removeEventListener("message", handleMessage);
            dataChannel.removeEventListener("open", handleOpen);
        };
    }, [dataChannel]);

    const handleStartStop = () => {
        if (isSessionActive) {
            stopSession();
        } else {
            startSession();
        }
    };

    return (
        <div className="bg-gradient-to-br from-neutral-950 to-neutral-800 border border-red-200 rounded-lg p-8 drop-shadow-2xl flex flex-col space-y-4 w-full max-w-2xl">
            <button
                className="bg-white border rounded-lg border-white text-black w-fit mx-auto p-3"
                onClick={handleStartStop}
                disabled={status.includes("Establishing") || status.includes("Requesting")}
                aria-label={isSessionActive ? "Stop Talking" : "Start Talking"}
            >
                {isSessionActive ? "Stop Talking" : "Start Talking"}
            </button>
            
            {status && (
                <div className="text-white text-center">{status}</div>
            )}
            
            <div className="flex-1 overflow-y-auto max-h-96 space-y-4 p-4 bg-neutral-900 rounded-lg">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`p-3 rounded-lg ${
                            message.role === 'assistant'
                                ? 'bg-blue-600 ml-4'
                                : 'bg-neutral-700 mr-4'
                        }`}
                    >
                        <div className="text-white">{message.content}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default Chat;