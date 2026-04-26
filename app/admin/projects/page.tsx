import { ProjectsAdminClient } from "@/app/admin/projects/projects-admin-client"
import { getProjectsGroupedFromDb, hasDatabaseConfig, type GroupedProjects } from "@/lib/projects-db"

async function getProjectsForAdmin(): Promise<GroupedProjects> {
  if (!hasDatabaseConfig()) return { real: [], personal: [] }

  try {
    return await getProjectsGroupedFromDb()
  } catch (error) {
    console.error("Failed loading projects for admin page:", error)
    return { real: [], personal: [] }
  }
}

export default async function AdminProjectsPage() {
  const projects = await getProjectsForAdmin()
  return <ProjectsAdminClient initialProjects={projects} />
}
