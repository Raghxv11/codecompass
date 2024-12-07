"use client";
import useProject from "@/hooks/use-project";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import CodeReferences from "./code-references";
import ReactMarkdown from 'react-markdown';

const AskQuestionCard = () => {
  const project = useProject();
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [filesReferences, setFilesReferences] = useState<{fileName: string, sourceCode: string, summary: string}[]>([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setAnswer("");
    setFilesReferences([]);
    e.preventDefault();
    if (!project?.projectId) return
    setLoading(true);
    const { output, filesReferences } = await askQuestion(question, project.projectId);
    setOpen(true);

    setFilesReferences(filesReferences);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer(ans => ans + delta);
      }
    }
    setLoading(false);
  };
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Image 
                src="/logo.jpg" 
                alt="logo" 
                width={32} 
                height={32} 
                className="rounded-full"
              />
              <span className="text-xl font-medium">{question}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-6 overflow-y-auto py-4">
            <div className="prose dark:prose-invert max-w-none">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                  <span>Analyzing codebase and generating response...</span>
                </div>
              ) : (
                <ReactMarkdown>{answer}</ReactMarkdown>
              )}
            </div>
            {!loading && filesReferences.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Referenced Files</h3>
                <CodeReferences filesReferences={filesReferences} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to add change the color of the button?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="h-4"></div>
            <Button type="submit" disabled={loading}>
              Ask
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
