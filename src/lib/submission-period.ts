export function getCurrentHalfYear(date = new Date()): { year: number; half: 1 | 2 } {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    const half = month < 6 ? 1 : 2;
    return { year, half };
}

export function getHalfYearFromPeriodStr(periodStr: string): { year: number; half: 1 | 2 } | null {
    if (!periodStr) return null;

    // Parse YYYY-MM-DD
    const parts = periodStr.split('-');
    if (parts.length >= 2) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // 0-based to match JS Date

        if (!isNaN(year) && !isNaN(month)) {
            const half = month < 6 ? 1 : 2;
            return { year, half };
        }
    }
    return null;
}

export function isInCurrentHalfYear(periodStr: string): boolean {
    const current = getCurrentHalfYear();
    const period = getHalfYearFromPeriodStr(periodStr);

    if (!period) return false;

    return current.year === period.year && current.half === period.half;
}

export function formatCurrentPeriod(): string {
    const { year, half } = getCurrentHalfYear();
    if (half === 1) {
        return `Semester 1 (Jan - Jun) ${year}`;
    }
    return `Semester 2 (Jul - Des) ${year}`;
}