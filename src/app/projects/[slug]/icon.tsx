import { getProject } from "@/lib/data/projects";
import { renderMarkSvg } from "@/lib/item-mark";

export const size = { width: 48, height: 48 };
export const contentType = "image/svg+xml";

export default async function Icon({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  const svg = project
    ? renderMarkSvg(project.id, project.name, project.archived ? "archive" : "project")
    : renderMarkSvg("system", "SYSTEM", "app");
  return new Response(svg, { headers: { "Content-Type": contentType } });
}
