"use client"
import React, { useState } from 'react'
import RequestForm from './RequestForm'

const UploadResume: React.FC = () => {
    const [file, setFile] = useState<File | null>(null)
    const [jobDescription, setJobDescription] = useState('')

    const handleResumeUpload = async (e:React.ChangeEvent<HTMLInputElement>) =>{
        const uploadedFile = e?.target.files?.[0]
        if(!uploadedFile){
            console.log("No file")
            return 
        }
        setFile(uploadedFile)
        return 
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(file)

    }

    return (
        <div className=''>
          <RequestForm setFormData={null} setIsLoading={true} />
        </div>
    )
}


export default UploadResume