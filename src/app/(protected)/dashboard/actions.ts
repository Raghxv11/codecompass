// file to handle the question and answer
"use server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createStreamableValue } from "ai/rsc";
import { generateEmbedding } from "@/lib/gemini";
import { streamText } from "ai";
import { db } from "@/server/db";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();
  console.log('Generating embedding for question:', question);
  const queryVector = await generateEmbedding(question);
  console.log('Generated query vector length:', queryVector.length);
  const vectorQuery = `[${queryVector.join(",")}]`;

  // Add a count query first
  const countResult = await db.$queryRaw`
    SELECT COUNT(*) 
    FROM "SourceCodeEmbedding"
    WHERE "projectId" = ${projectId}
  `;
  console.log('Total documents in database for project:', countResult);

  const result = (await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
    1- ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE "projectId" = ${projectId}
    ORDER BY 1- ("summaryEmbedding" <=> ${vectorQuery}::vector) DESC
    LIMIT 10
    `) as { fileName: string; sourceCode: string; summary: string; similarity: number }[];

  console.log('Query results:', result.map(r => ({
    fileName: r.fileName,
    similarity: r.similarity
  })));

  let context = "";
  if (result.length === 0) {
    context = "No relevant code files found in the project.";
  } else {
    for (const doc of result) {
      context += `
      File: ${doc.fileName}
      Source Code: ${doc.sourceCode}
      Summary: ${doc.summary}
      Similarity: ${doc.similarity}
      `;
    }
  }

  (async () => {
    const { textStream } = await streamText({
      model: google("gemini-1.5-flash"),
      prompt: `
      You are an AI code assistant that answers questions about the codebase. Your target audience is a technical intern who is trying to understand the codebase. 

      If no relevant code files are found, you should:
      1. Acknowledge that no directly relevant files were found
      2. Try to provide a general answer to the question based on common software development practices
      3. Suggest what kind of files or code the user might want to look for

      If relevant code files are found, you will provide a detailed answer, giving step-by-step instructions on how to implement the code.

      Use the following structure to formulate your responses:

      1. **Context Acknowledgment**: Briefly summarize the relevant parts that pertain to the question, or acknowledge if no relevant files were found.

      2. **Question Reiteration**: Restate the QUESTION for clarity.

      3. **Detailed Answer**:
         - Provide a thorough explanation related to the question.
         - Include code snippets where necessary.
         - Ensure that all steps are clearly outlined so that the intern can follow along easily.
         - If applicable, explain the purpose of the code and any important considerations or best practices.

      4. **Next Steps**: Suggest what the user should look into next or what files they might want to examine.

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
    context: context,
  }
}
