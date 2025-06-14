"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


export default function NotFound() {
  const router = useRouter();

  return (
    <>
      <div className="flex flex-col items-center justify-center mt-52">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black mb-2">🚫 404: Page Not Found</h1>
        <p className="font-black mb-1">Oops... Looks like you&apos;re lost.</p>
        <span className="text-muted-foreground font-bold">Even Google Maps can&apos;t find this page.</span>
        <Button onClick={() => router.push('/')} className="mt-4 button-accent">
          🏠 Take me home
        </Button>
      </div>
    </>
  );
}
