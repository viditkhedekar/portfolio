"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SURFACE_SCALE, type Surface } from "@/lib/surfaces";
import { getProject } from "@/lib/data/projects";
import { certificationGroups, certifications } from "@/lib/data/certifications";
import { predicted, qualification, school, subjects } from "@/lib/data/school";
import { channels, contactNote, identity } from "@/lib/data/identity";
import { system } from "@/lib/data/system";

/**
 * What each surface in the building says.
 *
 * Keyed by the id the renderer gave the rectangle, so adding a display is a
 * matter of registering it in the scene and adding a case here. Everything is
 * read from the data files, which is the whole reason this is HTML and not
 * paint: editing a grade changes the wall it is written on without
 * re-rendering six hundred metres of building.
 *
 * Type is sized in the surface's own space, a hundred pixels to the metre, so
 * a number set at ninety pixels here is most of a metre tall on the wall.
 */
export function surfaceContent(surface: Surface, open: () => void): React.ReactNode {
  const id = surface.id;

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

  if (id === "school-summary") return <SchoolSummary />;
  if (id === "school-subjects") return <SchoolSubjects />;
  if (id === "school-qualification") return <SchoolQualification />;
  if (id.startsWith("subject-")) return <SubjectPlate index={Number(id.slice(8))} />;

  if (id === "vault-index") return <VaultIndex />;
  if (id.startsWith("credential-")) {
    return <CredentialPlate index={Number(id.slice(11))} open={open} />;
  }

  if (id === "about-identity") return <AboutIdentity />;
  if (id === "about-statement") return <AboutStatement />;

  if (id === "comms-index") return <CommsIndex />;
  if (id.startsWith("channel-")) return <ChannelConsole index={Number(id.slice(8))} />;

  return null;
}

/* ------------------------------------------------------------------ shared */

function Panel({ label, title, children }: {
  label: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <span className="vk-face vk-face-wall">
      <span className="vk-face-label">{label}</span>
      {title ? <span className="vk-face-title">{title}</span> : null}
      {children}
    </span>
  );
}

function Line({ term, value, dim }: { term: string; value: string; dim?: boolean }) {
  return (
    <span className={`vk-face-line${dim ? " is-dim" : ""}`}>
      <span>{term}</span>
      <span>{value}</span>
    </span>
  );
}

/* ---------------------------------------------------------------- projects */

function ProjectConsole({ id, open }: { id: string; open: () => void }) {
  const project = getProject(id);
  if (!project) return null;

  return (
    <button type="button" onClick={open} className="vk-face vk-face-console">
      <span className="vk-face-head">
        <span>{project.id}</span>
        <span>{project.status}</span>
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

function ProjectBoard({ id, width, height }: { id: string; width: number; height: number }) {
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

/* ------------------------------------------------------------------ school */

function SchoolSummary() {
  return (
    <Panel label="02 / ACADEMIC SYSTEM" title="The record">
      <span className="vk-face-rows">
        <Line term="LEVEL" value={school.currentLevel} />
        <Line term="INSTITUTION" value={school.institution} />
        <Line term="YEAR" value={school.yearGroup} />
        <Line term="SINCE" value={school.since} />
        <Line term="COMPLETION" value={school.completion} />
      </span>
      <span className="vk-face-note">{school.note}</span>
    </Panel>
  );
}

function SchoolSubjects() {
  return (
    <Panel
      label={`${String(subjects.length).padStart(2, "0")} SUBJECTS IN PROGRESS`}
      title="Subjects"
    >
      <span className="vk-face-grid">
        {subjects.map((subject, i) => (
          <span key={subject.name} className="vk-face-cell">
            <span className="vk-face-index">{String(i + 1).padStart(2, "0")}</span>
            {subject.name}
          </span>
        ))}
      </span>
      <span className="vk-face-note">
        PREDICTED {predicted.grades} · {predicted.caveat}
      </span>
    </Panel>
  );
}

function SchoolQualification() {
  return (
    <Panel label="COMPLETED" title={qualification.grade}>
      <span className="vk-face-rows">
        <Line term="QUALIFICATION" value={qualification.name} />
        <Line term="MARK" value={qualification.mark} />
      </span>
      <span className="vk-face-note">{qualification.detail}</span>
    </Panel>
  );
}

function SubjectPlate({ index }: { index: number }) {
  const subject = subjects[index];
  if (!subject) return null;
  return (
    <span className="vk-face vk-face-plate">
      <span className="vk-face-plate-index">{String(index + 1).padStart(2, "0")}</span>
      <span className="vk-face-plate-name">{subject.name}</span>
    </span>
  );
}

/* ----------------------------------------------------------- certifications */

function VaultIndex() {
  return (
    <Panel label="03 / CREDENTIAL DATABASE" title="The vault">
      <span className="vk-face-rows">
        <Line term="RECORDS HELD" value={String(certifications.length).padStart(2, "0")} />
        <Line term="PROVIDERS" value={String(certificationGroups.length).padStart(2, "0")} />
      </span>
      <span className="vk-face-note">
        EVERY LIT SAFE ON THIS CORRIDOR HOLDS ONE RECORD. THE DARK ONES ARE ROOM.
      </span>
    </Panel>
  );
}

function CredentialPlate({ index, open }: { index: number; open: () => void }) {
  const record = certifications[index];
  if (!record) return null;

  return (
    <button type="button" onClick={open} className="vk-face vk-face-plate is-action">
      <span className="vk-face-plate-index">{record.issuer.toUpperCase()}</span>
      <span className="vk-face-plate-name">{record.name}</span>
    </button>
  );
}

/* ------------------------------------------------------------------- about */

function AboutIdentity() {
  return (
    <Panel label="04 / IDENTITY FILE" title={identity.name}>
      <span className="vk-face-rows">
        {identity.records.map((row) => (
          <Line key={row.key} term={row.key} value={row.value} />
        ))}
      </span>
    </Panel>
  );
}

function AboutStatement() {
  return (
    <Panel label="STATEMENT">
      <span className="vk-face-statement">{identity.statement}</span>
      <span className="vk-face-rows">
        {identity.blocks.map((block) => (
          <Line key={block.label} term={block.label} value={block.body} dim />
        ))}
      </span>
    </Panel>
  );
}

/* ----------------------------------------------------------------- contact */

function CommsIndex() {
  return (
    <Panel label="05 / COMMUNICATIONS" title="Open channels">
      <span className="vk-face-rows">
        <Line term="STATUS" value="OPEN" />
        <Line term="CHANNELS" value={String(channels.length).padStart(2, "0")} />
        <Line term="LOCATION" value={system.location} />
      </span>
      <span className="vk-face-note">{contactNote}</span>
    </Panel>
  );
}

function ChannelConsole({ index }: { index: number }) {
  const channel = channels[index];
  if (!channel) return null;

  if (!channel.href) {
    return (
      <span className="vk-face vk-face-channel is-off">
        <span className="vk-face-head">
          <span>{channel.label}</span>
          <span>UNCONFIGURED</span>
        </span>
      </span>
    );
  }

  return (
    <a
      href={channel.href}
      target={channel.href.startsWith("http") ? "_blank" : undefined}
      rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
      className="vk-face vk-face-channel"
    >
      <span className="vk-face-head">
        <span>{channel.label}</span>
        <span>OPEN</span>
      </span>
      <span className="vk-face-handle">{channel.handle}</span>
      <span className="vk-face-cta">
        CONNECT
        <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.6} />
      </span>
    </a>
  );
}
