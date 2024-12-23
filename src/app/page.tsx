import Image from "next/image";
import UploadResume from "./components/UploadResume";

export default function Home() {
  return (
    <div className='bg-neutral-200 min-h-screen flex flex-row justify-center'>
      <div className='flex flex-col justify-center'>
        <UploadResume />
      </div>
    </div>
  );
}
