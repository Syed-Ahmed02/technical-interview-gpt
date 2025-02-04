"use client";
import React, { useEffect, useRef, useState } from "react";
import { analyzeAudio } from "../lib/audioThreshhold";
type ChatProps = {
    interviewType:string;
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

const Chat: React.FC<ChatProps> = ({ interviewType, jobDescription }) => {
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
        SYSTEM SETTINGS:
        ------
        INSTRUCTIONS:
        - Your name is John, an artificial intelligence agent responsible to interview canidates.
        - You will recieve a job description, and an interview type (behavioural or technical).
        - Start by introducing yourself
        - Please ask the user 3 questions, after asking the questions you will provide the user on feedback
        - Your feedback should be concise and to the point. It should also give improvements for the user to work on
        ------
        PERSONALITY:
        - Be upbeat and genuine
        - Speek fast if user gives a good answer
        
        ------
        Interview Type:
        ${jobDescription}
        ------
        JOB DESCRIPTION:
        ${jobDescription}

        `;

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

            // Analyze audio and set up threshold
            const { audioContext } = analyzeAudio(stream);
            audioContextRef.current = audioContext;

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
            setStatus("Connection Established Successfully. Say Hello!");
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

            console.log("Received event:", event); // Debugging

            // Handle user's transcribed message
            if (event.type === 'conversation.item.input_audio_transcription.completed') {
                const userMessage = event.transcript;
                setMessages(prev => [...prev, {
                    role: 'user',
                    content: userMessage
                }]);
            }

            // Handle assistant's response (delta updates)
            if (event.type === 'response.audio_transcript.delta') {
                const assistantMessage = event.delta;
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.role === 'assistant') {
                        // Append the delta to the last assistant message
                        return [
                            ...prev.slice(0, -1),
                            { ...lastMessage, content: lastMessage.content + assistantMessage }
                        ];
                    } else {
                        // Create a new assistant message
                        return [...prev, { role: 'assistant', content: assistantMessage }];
                    }
                });
            }

            // Handle final assistant response (done event)
            if (event.type === 'response.audio_transcript.done') {
                const assistantMessage = event.transcript;
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.role === 'assistant') {
                        // Replace the last assistant message with the final transcript
                        return [
                            ...prev.slice(0, -1),
                            { ...lastMessage, content: assistantMessage }
                        ];
                    } else {
                        // Create a new assistant message
                        return [...prev, { role: 'assistant', content: assistantMessage }];
                    }
                });
            }
        };

        dataChannel.addEventListener("message", handleMessage);

        return () => {
            dataChannel.removeEventListener("message", handleMessage);
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
        <div className="bg-gradient-to-br from-neutral-950 to-neutral-800 border border-red-200 rounded-lg p-8 drop-shadow-2xl flex flex-col space-y-4 w-96">
            <button
                className="bg-white border rounded-lg border-white text-black w-full mx-auto p-3"
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
                    <div key={index} className={`flex flex-col ${message.role === 'assistant' ? 'items-end' : 'items-start'}`}>
                        <div className="text-white mb-1">
                            {message.role === 'assistant' ? 'John' : 'User'}
                        </div>
                        <div
                            className={`p-3 rounded-lg ${message.role === 'assistant'
                                ? 'bg-blue-600'
                                : 'bg-neutral-700'
                                }`}
                        >
                            <div className="text-white">{message.content}</div>
                        </div>
                    </div>

                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
export default Chat;