import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";

export const projectRouter = createTRPCRouter({
    createProject: protectedProcedure.input(
        z.object({
            name: z.string(),
            repoURL: z.string(),
            githubToken: z.string().optional(),
        })
    ).mutation(async ({ctx, input}) =>{
        const project = await ctx.db.project.create({
            data: {
                name: input.name,
                repoURL: input.repoURL,
                userToProject: {
                    create: {
                        userId: ctx.user.userId!,
                    }
                }
            }
        })
        await indexGithubRepo(project.id, input.repoURL, input.githubToken)
        await pollCommits(project.id)
        return project; 
    }),

    getProjects: protectedProcedure.query(async ({ctx}) => {
        return await ctx.db.project.findMany({
            where: {
                userToProject: {
                    some: {userId: ctx.user.userId!}
                }
            }
        })
    }),
    getCommits: protectedProcedure.input(z.object({
        projectId: z.string(),
    })).query(async ({ctx, input}) => {
        pollCommits(input.projectId).then().catch(console.error)
        return await ctx.db.commit.findMany({
            where: {
                projectId: input.projectId,
            }
        })
    })
})