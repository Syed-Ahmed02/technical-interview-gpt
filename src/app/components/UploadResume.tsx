"use client"
import React, { useEffect, useState } from 'react'
import RequestForm from './RequestForm'
import Chat from './Chat'
import Loading from './Loading'
const UploadResume: React.FC = () => {
    const [loading,setIsLoading] = useState(false)    
    const [showChat,setShowChat] = useState(false)
    const [interviewData, setInterviewData] = useState<{
        jobDescription: string
        interviewType:string
    }>
    ({
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
          {loading && !showChat && <Loading/>}
          {showChat && <Chat jobDescription={interviewData.jobDescription} interviewType={interviewData.interviewType} />}
        </div>
    )
}


export default UploadResume