import { api } from "@/trpc/react";
import React from "react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
    const {data: projects } = api.project.getProjects.useQuery(); 
    const [selectedProjectId, setSelectedProjectId] = useLocalStorage("selectedProjectId", ''); 
    const project = projects?.find((p) => p.id === selectedProjectId); 
    return {
        projects,
        selectedProjectId,
        project,
        setSelectedProjectId
    }
}

export default useProject; 