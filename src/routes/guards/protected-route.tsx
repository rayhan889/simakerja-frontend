import { useAuth, useHasRole } from "@/hooks/use-auth";
import type { UserRole } from "@/types/user.type";
import { useLocation, Navigate } from "react-router";

interface ProtectedRouteProps {
    children: React.ReactNode;

    allowedRoles?: UserRole[];
    
    redirectTo?: string;

    forbiddenRedirect?: string;
}

export function ProtectedRoute({
    children,
    allowedRoles = [],
    redirectTo = '/login',
    forbiddenRedirect = '/forbidden'
}: ProtectedRouteProps) {
    console.log("trying to entering protected routes")
    const {isInitialized, isLoading, isAuthenticated} = useAuth();
    const location = useLocation()
    const hasRequiredRole = useHasRole(...allowedRoles);

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

    if (!isAuthenticated) {
        console.log("redirect to login page")
        return (
            <Navigate 
                to={redirectTo} 
                state={{ from: location }} 
                replace 
            />
        )
    }

    if (allowedRoles.length > 0 && !hasRequiredRole) {
        return (
            <Navigate 
                to={forbiddenRedirect} 
                replace 
            />
        )
    }

    return <>{children}</>
}