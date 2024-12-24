"use client"
import React, { useState } from 'react'

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
        <div className='bg-black border border-red-200 outline rounded-lg p-8 drop-shadow-2xl flex flex-col space-y-2'>
            <form onSubmit={onSubmit}>
                <div className='flex flex-col'>
                    <label className='text-xs'>Upload Resume</label>
                    <input
                        type="file"
                        value={undefined}
                        className="bg-red-900 p-2 rounded-md w-96 overflow-hidden"
                        onChange={handleResumeUpload}
                    />

                </div>
                <div className='form-control'>
                    <label className='text-xs'>Paste Job Description</label>
                    <textarea className="w-full h-24 rounded-md border border-red-900 text-black resize-y p-2" value={jobDescription} onChange={(e)=>setJobDescription(e.target.value)} />
                </div>
                <div className='bg-red-700 rounded-md p-2 text-center hover:scale-105 hover:bg-red-600 ease-in duration-200 border border-neutral-200'>
                    <button type='submit' className=''>Submit!</button>
                </div>
            </form>
        </div>
    )
}


export default UploadResume