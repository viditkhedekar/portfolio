import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { growencyAds, growencyClients } from "@/lib/data/portfolio";

export function ClientList() {
  return (
    <div className="client-list">
      <span>Worked with at Growency</span>
      <ul>
        {growencyClients.map(({ name, detail, href }) => (
          <li key={href}>
            <a href={href}>{name}</a>
            {detail && <small>{detail}</small>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GrowencyAds({ eager = false }: { eager?: boolean }) {
  return (
    <figure className="ad-figure">
      <div className="ad-images">
        {growencyAds.map(({ src, alt, label }) => (
          <div className="ad-image" key={src}>
            <Image src={src} alt={alt} fill sizes="(max-width: 700px) 42vw, 26vw" loading={eager ? "eager" : "lazy"} />
            <span className="visually-hidden">{label}</span>
          </div>
        ))}
      </div>
      <figcaption>Moonshot Luna · Growency spec work</figcaption>
    </figure>
  );
}

export function ExternalArrow() {
  return <ArrowUpRight size={16} aria-hidden="true" />;
}
