import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    "/",
    "/api/webhook/clerk",
    "/api/webhook/stripe",
    "/pricing",
    "/about"
  ],
  ignoredRoutes: [
    "/api/webhook/clerk",
    "/api/webhook/stripe"
  ]
});
 
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};