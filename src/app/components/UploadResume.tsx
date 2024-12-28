"use client"
import React, { useEffect, useState } from 'react'
import RequestForm from './RequestForm'

const UploadResume: React.FC = () => {
    const [loading,setIsLoading] = useState(false)    
    const [showChat,setShowChat] = useState(false)
    const [interviewData, setInterviewData] = useState<{
        file: File | null,
        jobDescription: string
    }>
    ({
        file: null,
        jobDescription:""
    })

    useEffect(()=>{
        if(loading && interviewData.jobDescription !== "") {
            setShowChat(true)
        }
    },[interviewData.jobDescription])

    return (
        <div className=''>
          {!loading && <RequestForm fromData={interviewData} setFormData={setInterviewData} setIsLoading={setIsLoading} />}
          {showChat && <p>Sup chat {interviewData.jobDescription}</p>}
        </div>
    )
}


export default UploadResume