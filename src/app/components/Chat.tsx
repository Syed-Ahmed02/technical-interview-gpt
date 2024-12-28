"use client"
import React from "react";
import { useEffect,useRef,useState,Component } from "react";


const Chat:React.FC = () => {
    //Create new SpeechRecogition object, https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/SpeechRecognition
    const recognition = new SpeechRecognition(); 
    recognition.continuous=true
    recognition.lang = "en-CA"
    //https://www.youtube.com/watch?v=W0-hJ-9YG3I&ab_channel=GaelBeltran

    const startListening = () =>{
        recognition.start();
    }

    const stopListening = () =>{
        recognition.stop()
    }

  
    return (
    <div className="bg-gradient-to-br from-neutral-950 to-neutral-800 border border-red-200 rounded-lg p-8 drop-shadow-2xl flex flex-col space-y-2 w-96">
        <button className="bg-white text-black w-16 h-10">Start Yapping</button>

    </div>
  )
}

export default Chat