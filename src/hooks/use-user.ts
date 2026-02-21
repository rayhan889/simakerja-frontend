import { userService } from "@/api/services/user.service";
import { useAuthStore } from "@/store/auth.store";
import type { UpdateStudentRequest } from "@/types/user.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const userKeys = {
    all: ["users"] as const,
    details: (userId: string) => [...userKeys.all, 'details', userId] as const,
    students: () => [...userKeys.all, 'students'] as const,
    studentDetails: (userId: string) => [...userKeys.students(), 'details', userId] as const,
}

export function useUpdateStudent(userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: UpdateStudentRequest) => userService.updateStudent(userId, request),

        onSuccess: (response) => {
            queryClient.invalidateQueries({
                queryKey: userKeys.studentDetails(userId),
            })

            if (response?.data) {
                const { nim, studyProgram } = response.data;
                useAuthStore.getState().updateFields({ nim, studyProgram })
            }
        }
    })
}