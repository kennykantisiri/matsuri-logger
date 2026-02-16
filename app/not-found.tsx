"use client"

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
 
export default function NotFound() {

  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 min-h-screen justify-center items-center">
      <h1 className="text-red-500 text-5xl font-bold">404: NOT FOUND</h1>
      <p className="text-center w-lg px-5">Please exit this system if you have not been given delibrate access.
        Otherwise, contact your administrative support for assistance.</p>
      <Button asChild size="lg" variant="destructive">
        <a href="https://sdmatsuri.org" rel="noopener noreferrer">
          Return To Main Website
        </a>
      </Button>
    </div>
  )
}