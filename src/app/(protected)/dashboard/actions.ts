"use server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createStreamableValue } from "ai/rsc";
import { generateEmbedding } from "@/lib/gemini";
import { streamText } from "ai";
import { db } from "@/server/db";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();
  const queryVector = await generateEmbedding(question);
  const vectorQuery = `[${queryVector.join(",")}]`;
  const result = (await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
    1- ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE 1- ("summaryEmbedding" <=> ${vectorQuery}::vector) > .5
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10
    `) as { fileName: string; sourceCode: string; summary: string }[];
  let context = "";
  for (const doc of result) {
    context += `
    File: ${doc.fileName}
    Source Code: ${doc.sourceCode}
    Summary: ${doc.summary}
    `;
  }
  (async () => {
    const { textStream } = await streamText({
      model: google("gemini-1.5-flash"),
      prompt: `
      You are an AI code assistant that answers questions about the codebase. Your target audience is a technical intern who is trying to understand the codebase. 

      If the question is asking about code or a specific file, you will provide a detailed answer, giving step-by-step instructions on how to implement the code. 

      Use the following structure to formulate your responses:

      1. **Context Acknowledgment**: If a CONTEXT BLOCK is provided, briefly summarize the relevant parts that pertain to the question.

      2. **Question Reiteration**: Restate the QUESTION for clarity.

      3. **Detailed Answer**:
         - Provide a thorough explanation related to the question.
         - Include code snippets where necessary.
         - Ensure that all steps are clearly outlined so that the intern can follow along easily.
         - If applicable, explain the purpose of the code and any important considerations or best practices.

      4. **Limitations**: If the CONTEXT does not contain the answer, state clearly that you do not know, without making assumptions or fabricating information.

      5. **Markdown Format**: Ensure that your entire response is formatted in markdown, making it easy to read and understand.

      CONTEXT: ${context}
      QUESTION: ${question}

      `,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }
    stream.done();
  })();
  return {
    output: stream.value,
    filesReferences: result,
  }
}
