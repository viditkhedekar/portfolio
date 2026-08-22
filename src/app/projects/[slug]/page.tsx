import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/ProjectDetail";
import { getProject, projects, slugOf } from "@/lib/data/projects";
import { isPlaceholder } from "@/components/ui";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: slugOf(p) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "File not found" };
  const name = isPlaceholder(project.name) ? project.id : `${project.id} · ${project.name}`;
  return {
    title: name,
    description: isPlaceholder(project.summary) ? undefined : project.summary,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
