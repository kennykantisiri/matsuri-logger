import Image from "next/image";

export default function Loading() {
    return (
        <div className="bg-[#562B00] min-h-screen flex flex-col gap-y-3 items-center justify-center text-center">
            <Image src="/matsuri-logo.png" alt="Matsuri logo" width={200} height={200} className="mb-4" />
            <p className="text-4xl text-[#FFD4A7]">
                LOADING...
            </p>
        </div>
    );
}