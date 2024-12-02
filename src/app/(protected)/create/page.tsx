"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";
type FormInput = {
  projectName: string;
  repoURL: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();
  const refetch = useRefetch(); 
  function onSubmit(data: FormInput) {
    createProject.mutate(
      {
        repoURL: data.repoURL,
        name: data.projectName,
        githubToken: data.githubToken,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully");
          refetch();
          reset();
        },
        onError: () => {
          toast.error("Failed to create project");
        },
      },
    );
    return true;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Link your GitHub Repository</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project-name">Project Name</Label>
          <Input
            required
            {...register("projectName")}
            id="project-name"
            placeholder="Enter project name"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="repository">Repository URL</Label>
          <Input
            required
            {...register("repoURL")}
            id="repository"
            type="url"
            placeholder="Enter repository URL"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="github-token">Github Token (Optional)</Label>
          <Input
            {...register("githubToken")}
            id="github-token"
            placeholder="Enter github token"
            className="w-full"
          />
        </div>
        <Button type="submit" disabled={createProject.isPending}>
          {createProject.isPending ? "Creating..." : "Create Project"}
        </Button>
      </form>
    </div>
  );
};

export default CreatePage;
