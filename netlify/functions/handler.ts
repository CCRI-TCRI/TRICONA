import type { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  // Get the URL path
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Skip handling for static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
  ) {
    return context.next();
  }

  // Pass through to Netlify's Next.js handler
  return context.next();
};

export const config = {
  path: "/*",
};
