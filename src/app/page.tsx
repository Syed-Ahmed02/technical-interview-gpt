import Image from "next/image";
import UploadResume from "./components/UploadResume";

export default function Home() {
  return (
    <div className='bg-neutral-900 min-h-screen flex flex-row justify-center'>
      <div className='flex flex-col justify-center items-center space-y-16'>
        <div className="text-center space-y-4">
          <h1 className="text-3xl text-white text-bold">
            Pratice your interview skills with a personal AI Interviewer
          </h1>
          <h2 className="text-xl">
            Just paste the job url & choose your type of interview below
          </h2>
        </div>
        <UploadResume />
      </div>
    </div>
  );
}
