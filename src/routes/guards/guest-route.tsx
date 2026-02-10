import { useAuth } from "@/hooks/use-auth";
import { Navigate, useLocation } from "react-router";

export function GuestRoute({
    children,
    redirectTo = '/dashboard',
}: {
    children: React.ReactNode;
    redirectTo?: string;
}) {
    const {isInitialized, isLoading, isAuthenticated} = useAuth();
    const location = useLocation();

    if (!isInitialized || isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Memuat...</p>
                </div>
            </div>
        )
    }

    if (isAuthenticated) {
        const from = (location.state as { from?: string })?.from || redirectTo;
        return <Navigate to={from} replace />;
    }

    return <>{children}</>
}