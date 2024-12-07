"use client";
import React from 'react'
import useProject from '@/hooks/use-project';
import { api } from '@/trpc/react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ExternalLink, GitCommit } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const CommitLog = () => {
    const { projectId, project } = useProject()
    const { data: commits, isLoading } = api.project.getCommits.useQuery({ projectId });

    if (isLoading) {
        return (
            <div className="rounded-lg border border-border p-4 animate-pulse">
                <div className="h-6 w-32 bg-muted rounded mb-4" />
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-muted" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-muted rounded w-1/4" />
                                <div className="h-4 bg-muted rounded w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-4">
                <GitCommit className="size-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Recent Commits</h2>
            </div>
            
            <ScrollArea className="h-[400px] pr-4">
                <ul className='space-y-8'>
                    {commits?.map((commit, commitIdx) => (
                        <li key={commit.id} className='relative flex gap-x-6 hover:bg-muted/50 rounded-lg p-4 transition-colors group'>
                            <div className={cn(
                                commitIdx === commits.length - 1 ? 'h-6' : '-bottom-6',
                                'absolute left-0 top-0 flex w-6 justify-center'
                            )}>
                                <div className='translate-x-[20px] w-px bg-primary/20'></div>
                            </div>

                            <img 
                                src={commit.commitAuthorAvatar} 
                                alt={commit.commitAuthorName} 
                                className='relative mt-1 size-10 flex-none bg-white shadow-md ring-2 ring-primary/10 rounded-full' 
                            />

                            <div className='flex-1 flex flex-col gap-2'>
                                <div className='flex items-center justify-between'>
                                    <div className="flex items-center gap-3">
                                        <Link 
                                            target='_blank' 
                                            href={`${project?.repoURL}/commits/${commit.commitHash}`} 
                                            className='text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors'
                                        >
                                            {commit.commitAuthorName}
                                            <ExternalLink className='size-3.5 opacity-0 group-hover:opacity-100 transition-opacity' />
                                        </Link>
                                        <code className="text-xs px-2 py-0.5 bg-muted rounded-md font-mono text-muted-foreground">
                                            {commit.commitHash.slice(0, 7)}
                                        </code>
                                    </div>
                                    <time className='text-sm font-medium text-muted-foreground'>
                                        {new Date(commit.createdAt).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </time>
                                </div>

                                <p className='font-medium text-sm leading-relaxed'>
                                    {commit.commitMessage}
                                </p>

                                {commit.summary && (
                                    <p className='text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/20 pl-3'>
                                        {commit.summary.split('\n').map((line, index) => (
                                            <React.Fragment key={index}>
                                                {line}
                                                {index < commit.summary.split('\n').length - 1 && <br />}
                                            </React.Fragment>
                                        ))}
                                    </p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </ScrollArea>
        </div>
    )
}

export default CommitLog;
