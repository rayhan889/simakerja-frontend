import * as z from 'zod';
import type { StudentInfo } from '@/types/user.type';

export const studentInfoSchema = z.object({
    fullName: z.string({ error: "Nama lengkap mahasiswa harus diisi" })
        .min(1, "Nama lengkap mahasiswa harus diisi"),
    nim: z.string({ error: "NIM mahasiswa harus diisi" }).min(11, "NIM mahasiswa harus terdiri dari minimal 11 karakter"),
    email: z.email("Format email mahasiswa tidak valid"),
});

export const studentSnapshotSchema = z.object({
    studyProgram: z
        .string({ error: "Program studi harus dipilih" })
        .min(1, "Program studi harus dipilih"),
    
    students: z
        .array(studentInfoSchema)
        .min(1, "Minimal 1 mahasiswa harus ditambahkan")
        .max(3, "Maksimal 3 mahasiswa per grup"),
    
    unit: z
        .string({ error: "Unit/Departemen harus diisi" })
        .min(1, "Unit/Departemen harus diisi"),
});

export const studentSnapshotsSuperRefine = (
    snapshots: z.infer<typeof studentSnapshotSchema>[],
    ctx: z.RefinementCtx
) => {
    const seenCombinations = new Set<string>();
    const duplicateIndices: number[] = [];
    const seenStudentNims = new Set<string>();
    const duplicateStudentNims: string[] = [];
    
    for (let i = 0; i < snapshots.length; i++) {
        const snapshot = snapshots[i];
        
        if (!snapshot.studyProgram || !snapshot.unit) {
            continue;
        }
        
        const compositeKey = `${snapshot.studyProgram}|${snapshot.unit}`;
        
        if (seenCombinations.has(compositeKey)) {
            duplicateIndices.push(i);
        } else {
            seenCombinations.add(compositeKey);
        }

        for (const student of snapshot.students) {
            if (seenStudentNims.has(student.nim)) {
                duplicateStudentNims.push(student.nim);
            } else {
                seenStudentNims.add(student.nim);
            }
        }
    }
    
    if (duplicateIndices.length > 0) {
        ctx.addIssue({
            code: 'custom',
            message: "Kombinasi Program Studi dan Unit/Departemen tidak boleh sama antar grup mahasiswa. Setiap grup harus memiliki kombinasi yang unik.",
            path: [],
        });
    }

    if (duplicateStudentNims.length > 0) {
        ctx.addIssue({
            code: 'custom',
            message: `NIM ${duplicateStudentNims.join(', ')} sudah digunakan di grup mahasiswa lain. Setiap mahasiswa hanya boleh muncul di satu grup.`,
            path: [],
        });
    }
};

export function studentInfoToNims(students: StudentInfo[] | undefined): string[] {
    return students?.map((s) => s.nim) ?? [];
}

export function nimsToStudentInfo(
    nims: string[],
    studentsList: StudentInfo[] | undefined
): StudentInfo[] {
    if (!studentsList) return [];
    const byNim = new Map(studentsList.map((s) => [s.nim, s]));
    return nims.map((nim) => byNim.get(nim)).filter((s): s is StudentInfo => s != null);
}

/**
 * Build a per-group set of NIMs that are already selected in OTHER groups.
 * `excludedNimsForGroup[i]` = Set of NIMs selected in all groups except group `i`.
 */
export function buildExcludedNimsPerGroup(
    studentSnapshots: { students: StudentInfo[] | { fullName: string; nim: string; email: string }[] }[] | undefined
): Set<string>[] {
    if (!studentSnapshots) return [];

    // Collect all NIMs per group
    const nimsPerGroup = studentSnapshots.map(
        (snapshot) => new Set((snapshot.students ?? []).map((s) => s.nim))
    );

    // For each group, union all OTHER groups' NIMs
    return nimsPerGroup.map((_, groupIndex) => {
        const excluded = new Set<string>();
        for (let j = 0; j < nimsPerGroup.length; j++) {
            if (j === groupIndex) continue;
            for (const nim of nimsPerGroup[j]) {
                excluded.add(nim);
            }
        }
        return excluded;
    });
}
