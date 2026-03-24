export const displayFullName = (fullName: string): string => {
    const nameWithoutTitle = fullName.replace(/^[^_]*_/, ""); // remove 3 digits of nim
    const nameWithoutStudyProgram = nameWithoutTitle.replace(/\s*TI.*$/, ""); // remove study program, assuming it starts with "TI" and is at the end of the string
    const cleanLetters = nameWithoutStudyProgram.replace(/[^a-zA-Z\s]/g, "");

    return cleanLetters
        .toLowerCase()
        .split(' ')
        .filter(word => word.length > 0) // Remove extra spaces
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}