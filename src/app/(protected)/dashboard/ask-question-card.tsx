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
import ReactMarkdown from "react-markdown";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import useRefetch from "@/hooks/use-refetch";

const AskQuestionCard = () => {
  const project = useProject();
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [filesReferences, setFilesReferences] = useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const saveAnswer = api.project.savedAnswers.useMutation();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setAnswer("");
    setFilesReferences([]);
    e.preventDefault();
    if (!project?.projectId) return;
    setLoading(true);
    const { output, filesReferences } = await askQuestion(
      question,
      project.projectId,
    );
    setOpen(true);

    setFilesReferences(filesReferences);
    console.log(filesReferences);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((ans) => ans + delta);
      }
    }
    setLoading(false);
  };

  const refetch = useRefetch()
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="h-[80vh] max-w-4xl">
          <DialogHeader className="border-b pb-4">
            <VisuallyHidden>
              <DialogTitle>Question and Answer Dialog</DialogTitle>
            </VisuallyHidden>
            <div className="flex items-center gap-2">
              <Image
                src="/logo.jpg"
                alt="logo"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-xl font-medium">{question}</span>
            </div>
            <Button
              disabled={saveAnswer.isPending}
              variant={"outline"}
              onClick={() =>
                saveAnswer.mutate(
                  {
                    projectId: project.projectId,
                    question: question,
                    answer: answer,
                    filesReferenced: filesReferences,
                  },
                  {
                    onSuccess: () => {
                      toast.success("Answer saved");
                      refetch();
                    },
                    onError: () => toast.error("Error saving answer"),
                  },
                )
              }
            >
              Save answer
            </Button>
          </DialogHeader>
          <div className="flex flex-col gap-6 overflow-y-auto py-4">
            <div className="prose dark:prose-invert max-w-none">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <span>Analyzing codebase and generating response...</span>
                </div>
              ) : answer.includes("This project contains a large number of files") || answer.includes("No files have been indexed") ? (
                <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4">
                  <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    {answer.includes("This project contains a large number of files") 
                      ? "Large Codebase Detected"
                      : "No Indexed Files"}
                  </h3>
                  <ReactMarkdown className="text-yellow-700 dark:text-yellow-300">
                    {answer}
                  </ReactMarkdown>
                </div>
              ) : (
                <ReactMarkdown>{answer}</ReactMarkdown>
              )}
            </div>
            {!loading && filesReferences.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="mb-4 text-lg font-medium">Referenced Files</h3>
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
              placeholder="Which files should I edit to modify the button color in the login form?"
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
