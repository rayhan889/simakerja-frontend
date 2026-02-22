export const displayFullName = (fullName: string): string => {
    const nameWithoutTitle = fullName.replace(/^[^_]*_/, ""); // remove 3 digits of nim
    const nameWithoutStudyProgram = nameWithoutTitle.replace(/\s*TI.*$/, ""); // remove study program, assuming it starts with "TI" and is at the end of the string
    return nameWithoutStudyProgram.trim();
}