import { db } from "@/server/db";
import { Octokit } from "octokit";

export const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

const repoURL = "https://github.com/kodegakure-dev/kodegakure";
type Response = {
    commitHashes: string[];
    commitMessage: string[];
    commitAuthorName: string[];
    commitAuthorAvatar: string[];
    commitDate: string[];
};

export const getCommitHashes = async (repoURL: string) : Promise<Response> => {
  const { data } = await octokit.rest.repos.listCommits({
    owner: "kodegakure-dev",
    repo: "kodegakure",
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
}

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
    const unprocessedCommits = await db.commit.findMany({
        where: {projectId}
    })
    
}

