import { AuthLayout } from "@/components/auth/AuthLayout";

export default function LoginLoading() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your orders, saved addresses, and synced wishlist."
      activeTab="login"
    >
      <div className="space-y-4" aria-busy="true" aria-label="Loading sign-in form">
        <div className="h-11 w-full animate-pulse rounded-2xl bg-secondary/70" />
        <div className="space-y-2">
          <div className="h-4 w-28 animate-pulse rounded bg-secondary/70" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-secondary/70" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-secondary/70" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-secondary/70" />
        </div>
        <div className="h-12 w-full animate-pulse rounded-xl bg-accent/30" />
      </div>
    </AuthLayout>
  );
}
