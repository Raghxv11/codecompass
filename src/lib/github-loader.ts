// Handles loading and indexing GitHub repositories
// Creates embeddings for code search functionality

import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { summarizeCode, generateEmbedding } from "./gemini";
import { db } from "@/server/db";

// Function to load files from a GitHub repository
export const loadGithubRepo = async (repoURL: string, githubToken?: string) => {
  const loader = new GithubRepoLoader(repoURL, {
    accessToken: githubToken || "",
    branch: "main",
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
      "node_modules",
      "dist",
      "build",
      "out",
      "public",
      "static",
      "test",
      "tests",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });
  const docs = await loader.load();
  return docs;
};

// Main function to index a GitHub repository
// 1. Loads all files
// 2. Generates summaries and embeddings
// 3. Stores in database for semantic search
export const indexGithubRepo = async (
  projectId: string,
  repoURL: string,
  githubToken?: string,
) => {
  console.log('Starting indexing for project:', projectId);
  const docs = await loadGithubRepo(repoURL, githubToken);
  console.log('Loaded documents count:', docs.length);
  
  const allEmbeddings = await generateEmbeddings(docs);
  console.log('Generated embeddings count:', allEmbeddings.length);
  
  await Promise.all(
    allEmbeddings.map(async (embedding, index) => {
      if (!embedding) {
        console.log(`Skipping null embedding at index ${index}`);
        return;
      }

      console.log(`Processing file ${index + 1}/${allEmbeddings.length}: ${embedding.fileName}`);
      console.log('Embedding vector length:', embedding.embeddings.length);
      
      try {
        const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
          data: {
            summary: embedding.summary,
            sourceCode: embedding.sourceCode,
            fileName: embedding.fileName,
            projectId,
          },
        });
        
        await db.$executeRaw`
          UPDATE "SourceCodeEmbedding"
          SET "summaryEmbedding" = ${embedding.embeddings}::vector
          WHERE "id" = ${sourceCodeEmbedding.id}
        `;
        
        console.log(`Successfully stored embedding for ${embedding.fileName}`);
      } catch (error) {
        console.error(`Error storing embedding for ${embedding.fileName}:`, error);
      }
    }),
  );
  
  // Verify storage
  const storedCount = await db.sourceCodeEmbedding.count({
    where: { projectId }
  });
  console.log(`Completed indexing. Stored ${storedCount} embeddings for project ${projectId}`);
};

const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(
    docs.map(async (doc) => {
      const summary = await summarizeCode(doc);
      const embeddings = await generateEmbedding(summary);
      return {
        summary,
        embeddings,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
        fileName: doc.metadata.source,
      };
    }),
  );
};
