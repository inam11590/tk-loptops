import { AuthLayout } from "@/components/auth/AuthLayout";

export default function RegisterLoading() {
  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join TK Laptop to track orders, save shipping addresses, and manage your 1-year warranty."
      activeTab="register"
    >
      <div className="space-y-4" aria-busy="true" aria-label="Loading registration form">
        <div className="space-y-2">
          <div className="h-4 w-28 animate-pulse rounded bg-secondary/70" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-secondary/70" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-11 w-full animate-pulse rounded-xl bg-secondary/70" />
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
