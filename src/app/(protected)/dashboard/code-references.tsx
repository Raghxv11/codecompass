"use client";
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Props = {
    // Array of files found by semantic search
    filesReferences: { fileName: string; sourceCode: string; summary: string }[];
}

const CodeReferences = ({ filesReferences }: Props) => {
    // Track currently selected file tab
    const [tab, setTab] = useState(filesReferences[0]?.fileName)
    if (!filesReferences.length) return null;
    
    return (
        <div className='w-full'>
            <Tabs value={tab} onValueChange={setTab}>
                <div className="overflow-x-auto flex gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg mb-4">
                    {filesReferences.map((file) => (
                        <button 
                            key={file.fileName} 
                            onClick={() => setTab(file.fileName)} 
                            className={cn(
                                'p-2 rounded-md text-sm whitespace-nowrap transition-colors',
                                tab === file.fileName 
                                    ? 'bg-white dark:bg-gray-700 shadow-sm' 
                                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                            )}
                        >
                            {file.fileName}
                        </button>
                    ))}
                </div>
                {filesReferences.map((file) => (
                    <TabsContent value={file.fileName} key={file.fileName}>
                        <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                            {file.summary}
                        </div>
                        <div className="rounded-lg overflow-hidden">
                            <SyntaxHighlighter 
                                language='javascript' 
                                style={atomDark}
                                customStyle={{
                                    margin: 0,
                                    borderRadius: '0.5rem',
                                }}
                            >
                                {file.sourceCode}
                            </SyntaxHighlighter>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

export default CodeReferences;
