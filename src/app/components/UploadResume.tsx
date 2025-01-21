"use client"
import React, { useEffect, useState } from 'react'
import RequestForm from './RequestForm'
import Chat from './Chat'
const UploadResume: React.FC = () => {
    const [loading,setIsLoading] = useState(false)    
    const [showChat,setShowChat] = useState(false)
    const [interviewData, setInterviewData] = useState<{
        file: File | null,
        jobDescription: string
        interviewType:string
    }>
    ({
        file: null,
        jobDescription:"",
        interviewType:""
    })

    useEffect(()=>{
        if(loading && interviewData.jobDescription !== "") {
            setShowChat(true)
        }
    },[interviewData.jobDescription])


    return (
        <div className=''>
          {!loading && <RequestForm fromData={interviewData} setFormData={setInterviewData} setIsLoading={setIsLoading} />}
          {showChat && <Chat jobDescription={interviewData.jobDescription} resumeData={interviewData.file!} />}
        </div>
    )
}


export default UploadResume