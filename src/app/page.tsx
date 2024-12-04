"use client"
import { Button } from "@/components/ui/button";
import Link from "next/link"
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] px-4 overflow-hidden">
      <motion.div 
        className="absolute inset-0 -z-10"
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent dark:from-slate-900 dark:via-slate-900/50 dark:to-transparent" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-3xl text-center space-y-8 mb-12"
      >
        <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl mt-28">
          Transform Data, Unleash the Power of
          <span className="text-primary"> Gen AI</span>
        </h1>
        
        <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto">
          Cutting-edge AI-powered solution to profile, clean, and transform your data seamlessly
        </p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/dashboard">
            <Button 
              size="lg" 
              className="font-semibold group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </Link>
          
          <Link href="/dashboard">
            <Button 
              variant="outline" 
              size="lg"
              className="font-semibold"
            >
              Learn More
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 w-full max-w-2xl mx-auto rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg"
        >
          <img src="/flowchart.png" alt="Data Pipeline Flowchart" className="w-full h-full object-cover" />
        </motion.div>
      </motion.div>
    </div>
  );
}