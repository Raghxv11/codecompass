import { db } from "@/server/db";
import { Octokit } from "octokit";
import axios from "axios";
import { summarizeCommit } from "./gemini";
export const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

const repoURL = "https://github.com/kodegakure-dev/kodegakure";
type Response = {
    commitHash: string;
    commitMessage: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string;
};

async function fetchProjectRepoURL(projectId: string) {
    const project = await db.project.findUnique({
        where: {id: projectId},
        select: {
            repoURL: true,
        }
    });
    if (!project?.repoURL) {
        throw new Error("Project does not have a repo URL");
    }
    return {project, repoURL: project.repoURL};
}

async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]) {
    const processedCommits = await db.commit.findMany({
        where: {projectId}
    });
    const unprocessedCommits = commitHashes.filter((commit) => 
        !processedCommits.some((processedCommit) => 
            processedCommit.commitHash === commit.commitHash
        )
    );
    return unprocessedCommits;
}

async function AIsummarizeCommit(repoURL: string, commitHash: string) {
    const { data } = await axios.get(`${repoURL}/commit/${commitHash}.diff`, {
      headers: {
        Accept: "application/vnd.github.v3.diff",
      },
    });
    return await summarizeCommit(data) || "";
}

export const getCommitHashes = async (repoURL: string): Promise<Response[]> => {
  const [owner, repo] = repoURL.split("/").slice(-2)
  if (!owner || !repo) {
    throw new Error("Invalid repo URL")
  }
  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });
  const sortedCommits = data.sort((a: any, b: any) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()) as any;

  return sortedCommits.slice(0, 15).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit.message ?? "",
    commitAuthorName: commit.commit.author.name ?? "",
    commitAuthorAvatar: commit.author?.avatar_url ?? "",
    commitDate: commit.commit.author.date ?? "",
  }));
};

export const pollCommits = async (projectId: string) => {
    const {project, repoURL} = await fetchProjectRepoURL(projectId)
    const commitHashes = await getCommitHashes(repoURL)
    const unprocessedCommits = await filterUnprocessedCommits(projectId,commitHashes)
    const summarizedCommits = await Promise.allSettled(unprocessedCommits.map((commit) => AIsummarizeCommit(repoURL, commit.commitHash)));
    const commitSummaries = summarizedCommits.map((commit) => commit.status === "fulfilled" ? commit.value as string : "");
    const commit = await db.commit.createMany({
        data: commitSummaries.map((summary, index) => ({
            projectId: projectId,
            commitHash: unprocessedCommits[index]!.commitHash,
            commitMessage: unprocessedCommits[index]!.commitMessage,
            commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
            commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
            commitDate: unprocessedCommits[index]!.commitDate,
            summary
        })),
    });
    return commit;
}

