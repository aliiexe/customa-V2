// Clerk configuration - Keys from env, other settings hardcoded
export const clerkConfig = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
  signInUrl: "/login",
  signUpUrl: "/sign-up",
  afterSignInUrl: "/",
  afterSignUpUrl: "/",
  appearance: {
    elements: {
      formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
      card: "shadow-lg border border-gray-200",
      headerTitle: "text-2xl font-bold text-gray-900",
      headerSubtitle: "text-gray-600",
      formFieldInput: "border border-gray-300 focus:border-primary focus:ring-primary/20",
      formFieldLabel: "text-gray-700 font-medium",
      footerActionLink: "text-primary hover:text-primary/80",
    },
  },
};

// Set environment variables programmatically
if (typeof window !== 'undefined') {
  // Client-side
  (window as any).__CLERK_PUBLISHABLE_KEY = clerkConfig.publishableKey;
} else {
  // Server-side
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = clerkConfig.publishableKey;
  process.env.CLERK_SECRET_KEY = clerkConfig.secretKey;
  process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL = clerkConfig.signInUrl;
  process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL = clerkConfig.signUpUrl;
  process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = clerkConfig.afterSignInUrl;
  process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = clerkConfig.afterSignUpUrl;
} 