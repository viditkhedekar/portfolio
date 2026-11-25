import Image from "next/image";

export function ViditPortrait({ sizes, decorative = false }: { sizes: string; decorative?: boolean }) {
  return (
    <Image
      src="/vidit-portrait.webp"
      alt={decorative ? "" : "Stylised portrait of Vidit Khedekar"}
      width={640}
      height={585}
      sizes={sizes}
    />
  );
}
