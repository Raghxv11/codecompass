"use client"
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React, { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import AskQuestionCard from '../dashboard/ask-question-card'
import ReactMarkdown from 'react-markdown'

const QnaPage = () => {
  const {projectId} = useProject()
  const {data: questions} = api.project.getQuestions.useQuery({projectId})
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null)
  return (
      <Sheet>
        <AskQuestionCard />
        <div className="h-4"></div>
        <h1 className="text-2xl font-bold">Saved Questions</h1>
        <div className="h-2"></div>
        <div className="flex flex-col gap-4">
          {questions?.map((question) => (
            <div key={question.id} className="flex flex-col gap-2 rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-900">
              <SheetTrigger 
                className="flex items-center justify-between text-left"
                onClick={() => setActiveQuestion(question.id)}
              >
                <div>
                  <p className="font-medium">{question.question}</p>
                  <p className="text-sm text-gray-500">
                    {question.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-2xl">
                <div className="flex h-full flex-col gap-4 p-6">
                  <h2 className="text-xl font-semibold">{question.question}</h2>
                  <div className="prose dark:prose-invert max-w-none overflow-y-auto">
                    <ReactMarkdown>{question.answer}</ReactMarkdown>
                  </div>
                </div>
              </SheetContent>
            </div>
          ))}
        </div>
      </Sheet>
  )
}

export default QnaPage;
