"use client";
import React from "react";
import { useUser } from "@clerk/nextjs";
import useProject from "@/hooks/use-project";
import { Github } from "lucide-react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

const Dashboard = () => {
  const { project } = useProject();
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        <div className="w-fit rounded-md bg-primary px-4 py-3">
          <div className="flex items-center">
            <Github className="size-6 text-white" />
            <div className="ml-2">
              <p className="text-sm font-medium text-white">
                This project is linked to{" "}
                <Link
                  href={project?.repoURL ?? ""}
                  className="inline-flex items-center text-white/80 hover:underline"
                >
                  {project?.repoURL} <ExternalLink className="ml-1 size-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className="h-4"></div>
        <div className="flex items-center gap-4">
          Team Members
          InviteButton
          ArchiveButton
        </div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          AskQuestionCard 
          MeetingCard
        </div>
      </div>
      <div className="mt-8">
        Commit Log
      </div>
    </div>
  );
};

export default Dashboard;