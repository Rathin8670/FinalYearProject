'use client';


import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/home/Hero";
import { Showreel } from "@/components/home/Showreel";
import { Impact } from "@/components/home/Impact";
import { Work } from "@/components/home/Work";
import { Process } from "@/components/home/Process";
import { Services } from "@/components/home/Services";
import { FAQ } from "@/components/home/FAQ";
import { AiFab } from "@/components/home/AiFab";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  const { isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground cursor-none">
      <SmoothScroll />
      <CustomCursor />
      <Header />
      <Hero />
      <Showreel />
      <Impact />
      <Work />
      <Process />
      <Services />
      <FAQ />
      <AiFab />
      <Footer />
    </main>
  );
}
