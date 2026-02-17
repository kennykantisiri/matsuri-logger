"use client"

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
 
export default function NotFound() {

  const router = useRouter();

  return (
    <div className="flex flex-col mx-5 gap-6 min-h-screen justify-center items-center">
      <h1 className="text-red-500 text-5xl text-center blink font-bold">ERRM... YOU'RE LOST!</h1>
      <p className="text-center px-5 mx-10">Please exit this system if you have not been given delibrate access or have recently signed out.
        Otherwise, contact your administrative support for assistance.</p>
      <Button asChild size="lg" variant="destructive">
        <a href="https://sdmatsuri.org" rel="noopener noreferrer">
          Return To Main Website
        </a>
      </Button>
    </div>
  )
}