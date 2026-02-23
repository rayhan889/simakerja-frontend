import { useAuth } from "@/hooks/use-auth";
import type { AuthUser } from "@/types/auth.types";
import type { ReactNode } from "react";

interface FeatureGateProps {
  check: (user: AuthUser) => { allowed: boolean; reason?: string }
  children: ReactNode
  fallback?: (reason: string) => ReactNode
}


export const FeatureGate = ({
    check,
    children,
    fallback
}: FeatureGateProps) => {
    const { user } = useAuth();
    
    const result = check(user as AuthUser);

    if (!result.allowed) {
        if (fallback && result.reason) {
            return <>{fallback(result.reason)}</>
        }
        return null
    }

    return <>{children}</>
}
