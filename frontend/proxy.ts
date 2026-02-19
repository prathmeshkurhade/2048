import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protect only the score submission (handled server-side by FastAPI anyway)
// Leaderboard and game are public
const isProtectedRoute = createRouteMatcher(["/api/score(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
