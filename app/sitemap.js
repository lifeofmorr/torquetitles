import pages from "../content/pages.json";
import { SITE } from "../lib/data";

export default function sitemap() {
  const now = new Date();
  const routes = [
    { url: `${SITE.baseUrl}/`, priority: 1.0 },
    { url: `${SITE.baseUrl}/intake`, priority: 0.9 },
    ...Object.keys(pages).map((slug) => ({
      url: `${SITE.baseUrl}/${slug}`,
      priority: slug === "pricing" ? 0.9 : 0.8,
    })),
  ];
  return routes.map((r) => ({ ...r, lastModified: now }));
}
