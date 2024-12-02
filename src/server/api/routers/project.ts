import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
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
    })
})