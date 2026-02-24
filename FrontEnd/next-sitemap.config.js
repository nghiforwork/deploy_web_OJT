/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_FE,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  e,
  // generateRobotsTxt: true,      // generate robots.txt
  exclude: ['/api/**']
};
