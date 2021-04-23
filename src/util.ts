
export function clamp(v: number, minOrMax: number, max?: number): number {
    if (max == null) {
        return Math.min(v, minOrMax);
    } else {
        return v < minOrMax ? minOrMax : v > max ? max : v;
    }
}

export function exposeToWindow(obj: Record<string, any>) {
    for (const key of Object.keys(obj)) {
        (window as any)[key] = obj[key];
    }
}