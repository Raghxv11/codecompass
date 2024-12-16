"use client"
import React from 'react'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import useRefetch from '@/hooks/use-refetch'

const DeleteButton = () => {
    const deleteProject = api.project.deleteProject.useMutation()
    const {projectId} = useProject()
    const refetch = useRefetch()
  return (
    <Button disabled={deleteProject.isPending} variant="destructive" size="sm" onClick={()=> {
        const confirm = window.confirm("Are you sure you want to delete this project?")
        if(confirm) {
            deleteProject.mutate({projectId}, {onSuccess: () => {
                toast.success("Project deleted successfully")
                refetch()
            },
            onError: (error) => {
                toast.error(error.message)
            }
        })
        }
    }}>
      Delete
    </Button>
  )
}

export default DeleteButton
