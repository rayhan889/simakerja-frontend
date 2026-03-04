import type { QueryParams } from "@/types/table.types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userKeys } from "./use-user";
import { adminService } from "@/api/services/admin.service";
import type { CreateNewUserRequest } from "@/types/admin.types";

export function useGetAllUsers(params: QueryParams) {
    return useQuery({
        queryKey: userKeys.all,

        queryFn: () => adminService.listUsers(params),

        placeholderData: keepPreviousData,

        staleTime: 10 * 60 * 1000, // 10 minutes

        refetchOnWindowFocus: false,

        retry: 1,
    })
}

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateNewUserRequest) => adminService.createUser(request),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: userKeys.all,
            })
        }
    })
}