/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://jasonzhu.ai",
  generateRobotsTxt: false, // We maintain robots.txt manually
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ["/admin", "/admin/*", "/api/*"],
  transform: async (config, path) => {
    // Set higher priority for key pages
    let priority = config.priority;
    let changefreq = config.changefreq;

    if (path === "/" || path === "/zh" || path === "/en") {
      priority = 1.0;
      changefreq = "daily";
    } else if (path.includes("/blog") && !path.includes("/blog/")) {
      priority = 0.9;
      changefreq = "daily";
    } else if (path.includes("/blog/")) {
      priority = 0.8;
      changefreq = "weekly";
    } else if (path.includes("/tools") || path.includes("/services")) {
      priority = 0.8;
      changefreq = "weekly";
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
      // hreflang alternates are handled in HTML <head> via Next.js Metadata API
      alternateRefs: [],
    };
  },
};
