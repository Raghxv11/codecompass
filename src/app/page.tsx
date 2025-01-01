"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4">
      <div className="absolute top-4 left-20 flex flex-row items-center gap-2">
        <Image src="/logo.jpg" alt="logo" width={42} height={42} />
        <h1 className="text-xl font-bold">CodeCompass</h1>
      </div>
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-grid-slate-200 dark:bg-grid-slate-700 absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent dark:from-slate-900 dark:via-slate-900/50 dark:to-transparent" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-12 max-w-3xl space-y-8 text-center"
      >
        <h1 className="mt-28 text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
          Chat with your
          <span className="text-primary"> Github Repository</span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Instantly answer questions about your codebase and receive automated
          commit summaries using AI.
        </p>

        <motion.div
          className="flex flex-col justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/dashboard">
            <Button
              size="lg"
              className="group font-semibold"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </Link>

          <Link href="/learn-more">
            <Button variant="outline" size="lg" className="font-semibold">
              Learn More
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-12 w-full max-w-2xl overflow-hidden rounded-lg border border-slate-200 shadow-lg dark:border-slate-700"
        >
          <img src="/pic.png" alt="" className="h-full w-full object-cover" />
        </motion.div>
      </motion.div>
    </div>
  );
}
