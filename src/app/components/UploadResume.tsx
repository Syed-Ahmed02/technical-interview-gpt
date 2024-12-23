"use client"
import React from 'react'

const UploadResume: React.FC = () => {
    return (
        <div className='bg-black border border-red-200 outline rounded-lg p-8 drop-shadow-2xl flex flex-col space-y-4'>
            <div className='text-sm '>
                <label >test</label>
                <div className='bg-red-400 p-2 rounded-md w-64 overflow-hidden'>
                    <input type="file" className="" />
                </div>
            </div>
            <div className='bg-red-900 rounded-md p-2 text-center hover:scale-105 hover:bg-red-800 ease-in duration-200'>
                <button className=''>Submit!</button>
            </div>
        </div>
    )
}


export default UploadResume