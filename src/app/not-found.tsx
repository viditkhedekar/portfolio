import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-heading">
      <h1>Page not found.</h1>
      <Link className="work-link" href="/projects">Browse selected work</Link>
    </section>
  );
}
