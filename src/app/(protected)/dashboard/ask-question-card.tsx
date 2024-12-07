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

const AskQuestionCard = () => {
  const project = useProject();
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [filesReferences, setFilesReferences] = useState<{fileName: string, sourceCode: string, summary: string}[]>([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!project?.projectId) return
    setLoading(true);
    setOpen(true);
    const { output, filesReferences } = await askQuestion(question, project.projectId);
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <Image src="/logo.jpg" alt="logo" width={32} height={32} />
              <span className="text-xl font-bold">{question}</span>
            </DialogTitle>
          </DialogHeader>
            {answer}
            <h1>Files References</h1>
            {filesReferences.map(file =>{
                return <span>{file.fileName}</span>
            })}
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
            <Button type="submit">
              Ask
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
