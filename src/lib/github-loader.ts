import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { summarizeCode, generateEmbedding } from "./gemini";
import { db } from "@/server/db";

export const loadGithubRepo = async (repoURL: string, githubToken?: string) => {
  const loader = new GithubRepoLoader(repoURL, {
    accessToken: githubToken || "",
    branch: "main",
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });
  const docs = await loader.load();
  return docs;
};

export const indexGithubRepo = async (
  projectId: string,
  repoURL: string,
  githubToken?: string,
) => {
  const docs = await loadGithubRepo(repoURL, githubToken);
  const allEmbeddings = await generateEmbeddings(docs);
  await Promise.all(
    allEmbeddings.map(async (embedding, index) => {
      console.log(`Processing ${index} of ${allEmbeddings.length}`);
      if (!embedding) return;

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
    }),
  );
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
