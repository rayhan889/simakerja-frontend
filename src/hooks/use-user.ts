import { userService } from "@/api/services/user.service";
import { useAuthStore } from "@/store/auth.store";
import type { StudyProgram } from "@/types/submission.type";
import type { UpdateStudentRequest } from "@/types/user.type";
import { useMutation, useQuery, useQueryClient, useQueries } from "@tanstack/react-query";

type StudentSnapshosts = {
    studyProgram: string;
    students: {
        fullName: string;
        nim: string;
        email: string;
    }[];
    unit: string;
}[]

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

            queryClient.invalidateQueries({
                queryKey: userKeys.students(),
            })

            if (response?.data) {
                const { nim, studyProgram } = response.data;
                useAuthStore.getState().updateFields({ nim, studyProgram })
            }
        }
    })
}

export function useGetAllRegisteredStudents(excludeNim?: string, studyProgram?: StudyProgram) {
    return useQuery({
        queryKey: userKeys.students(),

        queryFn: () => userService.getAllRegisteredStudents(excludeNim, studyProgram),

        refetchOnWindowFocus: false,

        retry: 1,

        enabled: !!studyProgram
    })
}

export function useGetAllRegisteredFilteredStudents(excludeNim?: string, studentSnapshots?: StudentSnapshosts) {
    
    return useQueries({
        queries:
            (studentSnapshots ?? []).map((snapshot) => {
                const studyProgram = snapshot?.studyProgram as StudyProgram | undefined;

                return ({
                    queryKey: [
                        ...userKeys.students(),
                        excludeNim ?? 'none',
                        studyProgram ?? 'none',
                    ],
                    queryFn: () =>
                        userService.getAllRegisteredStudents(
                        excludeNim,
                        snapshot?.studyProgram as StudyProgram,
                    ),

                    enabled: !!studyProgram,
                    
                    staleTime: 5 * 60 * 1000, 
                    refetchOnWindowFocus: false,
                    refetchOnMount: false,
                    retry: 1,
                })
            }) || [],
    })
}