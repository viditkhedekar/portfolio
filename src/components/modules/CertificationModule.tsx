"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Certification } from "@/lib/types";
import { certifications } from "@/lib/data/certifications";
import { Container, Label, ModuleHeading, SectionTitle, Slot } from "@/components/ui";

function DocumentView({ cert, onClose }: { cert: Certification; onClose: () => void }) {
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[85] flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-[8vh] backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.article
        role="dialog"
        aria-modal="true"
        aria-label={`${cert.id} document`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[780px] border border-[var(--vk-line-mid)] bg-[var(--vk-bg-panel)] shadow-[0_24px_80px_-12px_rgba(0,0,0,0.8)]"
      >
        <div className="flex h-10 items-center justify-between border-b border-[var(--vk-line)] px-4">
          <span className="vk-mono text-[10px] tracking-[0.18em] text-[var(--vk-fg-dim)]">
            DOCUMENT VIEW · {cert.id}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close document"
            className="flex h-6 w-6 items-center justify-center text-[var(--vk-fg-faint)] transition-colors hover:text-[var(--vk-fg)]"
          >
            <X size={13} strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6 sm:p-10">
          <div className="vk-mono text-[10px] tracking-[0.2em] text-[var(--vk-accent)]">
            {cert.id}
          </div>
          <h2 className="mt-5 text-[28px] leading-tight tracking-tight">
            <Slot className="text-[var(--vk-fg)]">{cert.name}</Slot>
          </h2>

          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 border-y border-[var(--vk-line)] py-6 sm:grid-cols-4">
            {[
              { k: "ISSUER", v: cert.issuer },
              { k: "ISSUED", v: cert.issued },
              { k: "CREDENTIAL ID", v: cert.credentialId ?? "[ ID ]" },
              { k: "VERIFICATION", v: cert.verifyUrl ? "AVAILABLE" : "[ NOT SET ]" },
            ].map((f) => (
              <div key={f.k}>
                <Label as="dt">{f.k}</Label>
                <dd className="vk-mono mt-2 break-words text-[11px] tracking-[0.1em]">
                  <Slot className="text-[var(--vk-fg)]">{f.v}</Slot>
                </dd>
              </div>
            ))}
          </dl>

          {cert.summary && (
            <p className="mt-6 max-w-[58ch] text-[14px] leading-relaxed">
              <Slot className="text-[var(--vk-fg-dim)]">{cert.summary}</Slot>
            </p>
          )}

          {/* Evidence */}
          <div className="mt-8">
            <Label>EVIDENCE</Label>
            <div className="vk-scanlines relative mt-3 border border-[var(--vk-line)] bg-[var(--vk-bg)]">
              {!cert.evidence ? (
                <div className="vk-grid-bg flex aspect-[4/3] flex-col items-center justify-center gap-2">
                  <span className="vk-mono text-[10px] tracking-[0.2em] text-[var(--vk-fg-ghost)]">
                    NO DOCUMENT ATTACHED
                  </span>
                  <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]/70">
                    ADD A FILE TO /public AND SET `evidence`
                  </span>
                </div>
              ) : cert.evidenceKind === "image" ? (
                <div className="relative aspect-[4/3]">
                  <Image
                    src={cert.evidence}
                    alt={`${cert.name} credential document`}
                    fill
                    sizes="720px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <iframe
                  src={cert.evidence}
                  title={`${cert.name} credential document`}
                  className="aspect-[4/3] w-full"
                />
              )}
            </div>
          </div>

          {cert.verifyUrl && (
            <a
              href={cert.verifyUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="vk-mono mt-6 inline-block border border-[var(--vk-line)] px-4 py-2.5 text-[10px] tracking-[0.16em] text-[var(--vk-fg-dim)] transition-colors hover:border-[var(--vk-accent)] hover:text-[var(--vk-accent)]"
            >
              VERIFY CREDENTIAL →
            </a>
          )}
        </div>
      </motion.article>
    </motion.div>
  );
}

export function CertificationModule() {
  const [open, setOpen] = React.useState<Certification | null>(null);
  const years = React.useMemo(
    () => [...new Set(certifications.map((c) => c.issued))].sort(),
    [],
  );

  return (
    <Container>
      <ModuleHeading index="04" name="CERTIFICATIONS" subtitle="CREDENTIAL DATABASE" />

      <p className="max-w-[58ch] py-8 text-[15px] leading-relaxed text-[var(--vk-fg-dim)]">
        Formal credentials and the documents behind them. Each record opens as a
        document view with its evidence attached where a file exists.
      </p>

      <div className="grid grid-cols-2 gap-6 border-y border-[var(--vk-line)] py-6 sm:grid-cols-4">
        {[
          { label: "RECORDS", value: String(certifications.length).padStart(2, "0") },
          {
            label: "WITH EVIDENCE",
            value: String(certifications.filter((c) => c.evidence).length).padStart(2, "0"),
          },
          { label: "EARLIEST", value: years[0] ?? "—" },
          { label: "LATEST", value: years[years.length - 1] ?? "—" },
        ].map((f) => (
          <div key={f.label}>
            <Label>{f.label}</Label>
            <div className="vk-mono mt-2 text-[26px] leading-none tracking-tight text-[var(--vk-fg)]">
              {f.value}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-14">
        <SectionTitle right={`${String(certifications.length).padStart(2, "0")} RECORDS`}>
          RECORDS
        </SectionTitle>

        <ul className="mt-2">
          {certifications.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setOpen(c)}
                data-cursor="OPEN DOCUMENT"
                data-cursor-sub={c.id}
                className="group grid w-full gap-x-8 gap-y-3 border-b border-[var(--vk-line)] py-6 text-left transition-colors hover:bg-[var(--vk-bg-panel)] lg:grid-cols-[110px_minmax(0,1.3fr)_minmax(0,1fr)_90px_90px]"
              >
                <span className="vk-mono text-[10px] tracking-[0.14em] text-[var(--vk-fg-faint)] transition-colors group-hover:text-[var(--vk-accent)]">
                  {c.id}
                </span>

                <span className="text-[18px] tracking-tight transition-transform duration-300 group-hover:translate-x-1">
                  <Slot className="text-[var(--vk-fg)]">{c.name}</Slot>
                </span>

                <span className="vk-mono self-center text-[10px] tracking-[0.14em]">
                  <Slot className="text-[var(--vk-fg-faint)]">{c.issuer}</Slot>
                </span>

                <span className="vk-mono self-center text-[10px] tracking-[0.14em] text-[var(--vk-fg-faint)]">
                  {c.issued}
                </span>

                <span className="vk-mono self-center text-[9px] tracking-[0.14em] lg:text-right">
                  <span
                    className={
                      c.evidence ? "text-[var(--vk-accent)]" : "text-[var(--vk-fg-ghost)]"
                    }
                  >
                    {c.evidence ? "ATTACHED" : "NO FILE"}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <p className="vk-mono py-8 text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
          SELECT A RECORD TO OPEN THE DOCUMENT VIEW.
        </p>
      </div>

      <AnimatePresence>
        {open && <DocumentView cert={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </Container>
  );
}
