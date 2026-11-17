import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ai-push.ridge-it.site';
  
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /admin/
Disallow: /_next/
Disallow: /private/

# Allow specific API documentation
Allow: /api-docs

Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1`;

  return new NextResponse(robots, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24시간 캐시
    },
  });
}