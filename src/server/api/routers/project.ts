import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";

// TRPC router handling project-related operations

export const projectRouter = createTRPCRouter({
    // Creates a new project and indexes its repository
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

    // Retrieves all projects for the authenticated user
    getProjects: protectedProcedure.query(async ({ctx}) => {
        return await ctx.db.project.findMany({
            where: {
                userToProject: {
                    some: {userId: ctx.user.userId!}
                },
                deletedAt: null,
            }
        })
    }),

    // Gets and updates commit history for a project
    getCommits: protectedProcedure.input(z.object({
        projectId: z.string(),
    })).query(async ({ctx, input}) => {
        pollCommits(input.projectId).then().catch(console.error)
        return await ctx.db.commit.findMany({
            where: {
                projectId: input.projectId,
            }
        })
    }),
    savedAnswers: protectedProcedure.input(z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        filesReferenced: z.any()
    })).mutation(async ({ctx, input}) => {
        return await ctx.db.question.create({
            data: {
                question: input.question,
                answer: input.answer,
                filesReferenced: input.filesReferenced,
                projectId: input.projectId,
                userId: ctx.user.userId!,
            }
        })
    }),
    
    getQuestions: protectedProcedure.input(z.object({
        projectId: z.string(),
    })).query(async ({ctx, input}) => {
        return await ctx.db.question.findMany({
            where: {projectId: input.projectId},
            include: {
                user: true,
            },
            orderBy: {
                createdAt: "desc",
            }
        })
    }),
    deleteProject: protectedProcedure.input(z.object({ projectId: z.string() })).mutation(async ({ ctx, input }) => {
        return await ctx.db.project.update({
            where: {
                id: input.projectId,
            }, 
            data: {
                deletedAt: new Date(),
            }
        })
    })
})