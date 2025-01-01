"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenu,
  SidebarGroup,
} from "@/components/ui/sidebar";
import {
  Bot,
  LayoutDashboard,
  Presentation,
  CreditCard,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useSidebar } from "@/components/ui/sidebar";
import useProject from "@/hooks/use-project";

const items = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    title: "Q&A",
    icon: Bot,
    url: "/qna",
  },
  {
    title: "Meetings",
    icon: Presentation,
    url: "/meetings",
  },
  {
    title: "Billing",
    icon: CreditCard,
    url: "/billing",
  },
];


export default function AppSidebar() {
  const { open } = useSidebar();
  const pathname = usePathname();
  const {projects, projectId, setProjectId} = useProject(); 

  return (
    <Sidebar collapsible="icon" variant="floating">
      <Link href={"/"}><SidebarHeader className="flex flex-row items-center gap-2">
        <Image src="/logo.jpg" alt="logo" width={42} height={42} />
        {open && <h1 className="text-xl font-bold">CodeCompass</h1>}
      </SidebarHeader></Link>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={cn(
                          {
                            "!bg-primary !text-white": pathname === item.url,
                          },
                          "list-none",
                        )}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects?.map((project) => {
                return (
                  <SidebarMenuItem key={project.name}>
                    <SidebarMenuButton asChild>
                      <div onClick={() => setProjectId(project.id)}>
                        <div
                          className={cn(
                            "flex size-6 items-center justify-center rounded-sm border",
                            {
                              "bg-primary text-white": project.id === projectId,
                            },
                          )}
                        >
                          {project.name[0]}
                        </div>
                        <span>{project.name}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              <div className="h-2"></div>
              {open && (
                <SidebarMenuItem>
                  <Link href="/create">
                    <Button size="sm" variant="outline" className="w-fit">
                      <Plus />
                      Create Project
                    </Button>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
