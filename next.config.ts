import type { NextConfig } from "next";
import { portfolioPath } from "./src/lib/data/portfolio";
import { liveProjects, slugOf } from "./src/lib/data/projects";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/school", destination: "/", permanent: false },
      { source: "/certifications", destination: "/", permanent: false },
      { source: "/archive", destination: "/projects", permanent: false },
      ...liveProjects.map((project) => ({
        source: "/projects/" + slugOf(project),
        destination: portfolioPath(project),
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
