"use client"
import React, { useState } from 'react'

type FormData = {
    file: File | null;
    interviewType: string;
    jobDescription: string;
}

type RequestFormProps = {
    fromData: FormData,
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const RequestForm: React.FC<RequestFormProps> = ({ fromData, setFormData, setIsLoading }) => {
    const [file, setFile] = useState<File | null>(null)
    const [jobDescriptionUrl, setJobDescriptionUrl] = useState('');
    const [error, setError] = useState("")

    const handleInterviewType = (e: React.ChangeEvent<HTMLFormElement>) => {
        setFormData(data => ({
            ...data,
            interviewType: e.target.value
        }))
    }

    const handleSubmission = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('')
        setIsLoading(true)
        try {
            const uploadedFile = e?.target.files?.[0]
            if (!uploadedFile) {
                console.log("No file")
                return
            }
            setFile(uploadedFile)
            await scrapeJobDescription(jobDescriptionUrl)

        } catch {
            setError("No File")
        }
        return
    }

    const scrapeJobDescription = async (url: string) => {
        const res = await fetch('api/scrapper', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        })
        const resData = await res.json();
        setFormData(data => ({
            ...data,
            jobDescription: resData.textContent
        }))
    }


    return (
        <div className='bg-gradient-to-br from-neutral-950 to-neutral-800 border border-red-200 rounded-lg p-8 drop-shadow-2xl flex flex-col space-y-2 w-96'>
            <div>
                <label className='text-xs'>Job URL</label>
                <input
                    type="text"
                    className="w-full rounded-md border border-red-900 text-black p-2"
                    value={jobDescriptionUrl}
                    placeholder='https://www.linkedin.com/path-to-job-url'
                    onChange={(e) => setJobDescriptionUrl(e.target.value)}
                    required />
            </div>
            <div>
                <label className='text-xs'>Interview Type</label>
                <select
                    className="w-full rounded-md border border-red-900 text-black p-2"
                    value={fromData.interviewType}
                    onChange={(e) => setFormData(data => ({
                        ...data,
                        interviewType: e.target.value
                    }))}>
                    <option value="">Select Interview Type</option>
                    <option value="behavioural">Behavioural</option>
                    <option value="leetcode">Leetcode</option>
                </select>
            </div>
            <div className='flex flex-col bg-white w-full text-center py-2 text-black border rounded-lg shadow-sm font-bold from-neutral-950 shadow-red-900 border-red-900 hover:scale-105 hover:bg-green-800 ease-in duration-100 hover:shadow-green-800 hover:border-green-800 hover:text-white' >
                <input
                    type="file"
                    value={undefined}
                    className=""
                    onChange={handleSubmission}
                    hidden
                    id="file-upload"
                />
                <label htmlFor="file-upload" className=''>Upload Resume</label>
            </div>
        </div>
    )
}


export default RequestForm