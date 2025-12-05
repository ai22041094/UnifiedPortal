import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Spinner } from "@/components/ui/spinner";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
