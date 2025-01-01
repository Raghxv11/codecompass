"use client"
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LearnMore() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen py-16 px-4">
      {/* Simple gradient background instead of grid */}
      <motion.div 
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background to-background/80" />
      </motion.div>

      <div className="w-full max-w-4xl space-y-8 relative">
        {/* Back Button - Adjusted position */}
        <div className="absolute left-0 -top-2 sm:-left-20">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
              Back to Home
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-8 pt-16"
        >
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Chat with Your GitHub Repository!
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform allows you to interact with your repository like never before. 
              Get automated commit summaries and insights directly from your codebase.
            </p>
          </div>

          {/* Key Features Section */}
          <section className="space-y-6">
            <h2 className="text-3xl font-semibold text-center">Key Features</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Interactive Chat",
                  description: "Engage in a conversation with your codebase to retrieve information and insights."
                },
                {
                  title: "Automated Commit Summaries",
                  description: "Receive concise summaries of your commits, highlighting key changes and impacts."
                },
                {
                  title: "Efficient Codebase Retrieval",
                  description: "Utilize vector embeddings for fast and accurate information retrieval from your repository."
                },
                {
                  title: "Seamless Integration",
                  description: "Integrate effortlessly with your existing GitHub workflow."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors"
                >
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* How It Works Section */}
          <section className="space-y-6">
            <h2 className="text-3xl font-semibold text-center">How It Works</h2>
            <div className="space-y-4">
              {[
                {
                  title: "1. Connect Your GitHub Account",
                  description: "Link your GitHub account to start interacting with your repositories."
                },
                {
                  title: "2. Interact with Your Repository",
                  bullets: [
                    "Ask questions about your codebase and get instant responses.",
                    "Receive automated summaries of recent commits."
                  ]
                },
                {
                  title: "3. Built for speed and accuracy",
                  description: "Our platform uses an end-to-end RAG pipeline integrating LangChain and GitHub API with vector embeddings for efficient and accurate codebase information retrieval."
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 * index }}
                  className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm"
                >
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  {step.description && (
                    <p className="text-muted-foreground">{step.description}</p>
                  )}
                  {step.bullets && (
                    <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                      {step.bullets.map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}