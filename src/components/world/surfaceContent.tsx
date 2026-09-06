"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { SURFACE_SCALE, type Surface } from "@/lib/surfaces";
import { getProject } from "@/lib/data/projects";

/**
 * What each surface in the building says.
 *
 * Keyed by the id the renderer gave the rectangle, so adding a display is a
 * matter of registering it in the scene and adding a case here. Everything is
 * read from the data files, which is the whole reason this is HTML and not
 * paint: editing a project's summary changes the wall it is written on
 * without re-rendering six hundred metres of building.
 */
export function surfaceContent(surface: Surface, open: () => void): React.ReactNode {
  if (surface.kind === "console" && surface.project) {
    return <ProjectConsole id={surface.project} open={open} />;
  }
  if (surface.kind === "board" && surface.project) {
    return (
      <ProjectBoard
        id={surface.project}
        width={Math.round(surface.w * 2 * SURFACE_SCALE)}
        height={Math.round(surface.h * 2 * SURFACE_SCALE)}
      />
    );
  }
  return null;
}

/* ---------------------------------------------------------------- projects */

function ProjectConsole({ id, open }: { id: string; open: () => void }) {
  const project = getProject(id);
  if (!project) return null;

  return (
    <button type="button" onClick={open} className="vk-face vk-face-console">
      <span className="vk-face-head">
        <span className="vk-face-id">{project.id}</span>
        <span className="vk-face-status">{project.status}</span>
      </span>

      <span className="vk-face-name">{project.name}</span>
      <span className="vk-face-category">{project.category}</span>

      <span className="vk-face-body">{project.summary}</span>

      <span className="vk-face-stack">
        {project.technologies.map((tech) => (
          <span key={tech} className="vk-face-chip">
            {tech}
          </span>
        ))}
      </span>

      <span className="vk-face-cta">
        OPEN FILE
        <ArrowRight aria-hidden="true" size={18} strokeWidth={1.6} />
      </span>
    </button>
  );
}

function ProjectBoard({
  id,
  width,
  height,
}: {
  id: string;
  width: number;
  height: number;
}) {
  const project = getProject(id);
  const shot = project?.media?.[0];
  if (!project || !shot) return null;

  return (
    <span className="vk-face vk-face-board">
      {/* The board's pixel size is its metre size times the surface scale, so
          the optimiser is told exactly what this will be drawn at. */}
      <Image
        src={shot.src}
        alt={shot.alt}
        width={width}
        height={height}
        className="vk-face-shot"
      />
      <span className="vk-face-caption">
        <span>{project.name.toUpperCase()}</span>
        <span>{shot.ref}</span>
      </span>
    </span>
  );
}
