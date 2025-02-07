"use client"
import React, { useState } from 'react'

type FormData = {
    interviewType: string;
    jobDescription: string;
}

type RequestFormProps = {
    fromData: FormData,
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const RequestForm: React.FC<RequestFormProps> = ({ fromData, setFormData, setIsLoading }) => {
    const [jobDescriptionUrl, setJobDescriptionUrl] = useState('');
    const [error, setError] = useState("")

    const handleSubmission = async (e: React.ChangeEvent<HTMLFormElement>) => {
        setError('')
        setIsLoading(true)
        try {
            await scrapeJobDescription(jobDescriptionUrl)

        } catch {
            setError("Could not find ")
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
        <div className='flex flex-col justify-center items-center space-y-10'>
            <div className="text-center space-y-4">
                <h1 className="text-3xl text-white text-bold">
                    <span className='underline'>Ace your next interview</span> by praticing with a <span className='underline'>personal Ai Interviewer</span> 
                </h1>
                <h2 className="text-xl">
                    Just paste the job url & choose your type of interview below
                </h2>
            </div>
            <div className='bg-gradient-to-br from-neutral-950 to-neutral-800 border border-red-200 rounded-lg p-8 drop-shadow-2xl flex flex-col space-y-2 w-96'>
                <form onSubmit={handleSubmission}>
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
                            required
                            onChange={(e) => setFormData(data => ({
                                ...data,
                                interviewType: e.target.value
                            }))}>
                            <option value="">Select Interview Type</option>
                            <option value="behavioural">Behavioural</option>
                            <option value="technical">Technical</option>
                        </select>
                    </div>
                    <div className='flex flex-col items-center mt-4'>
                        <button className='bg-slate-950 border border-white  hover:bg-slate-900 ease-in duration-100 font-bold rounded-md text-base p-2 w-full' type='submit'>
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}


export default RequestForm