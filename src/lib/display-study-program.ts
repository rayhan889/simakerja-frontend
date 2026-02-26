export const displayStudyProgram = (value: string | undefined): string => {
    if (!value) return "";

    return value
        .toLowerCase()
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}