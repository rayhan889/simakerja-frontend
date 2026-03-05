export const getInitials = (name: string) => {
    if (!name) return "U";

    return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join("")
}