import type { MetadataRoute } from "next";

// Web app manifest: lets browsers install LeonEd to the home screen as a standalone app
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "LeonEd — School Management",
    short_name: "LeonEd",
    description:
      "LeonEd is a School Management System designed to simplify school administration by bringing essential school operations into one connected platform.",
    // Installed app skips the landing page: /launch routes to login or the user's dashboard
    start_url: "/launch",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0e2e23",
    theme_color: "#003f27",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
