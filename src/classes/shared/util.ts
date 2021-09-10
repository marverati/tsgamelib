
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

export function rndIndex<T>(array: T[]): number {
    return Math.floor(Math.random() * array.length);
}

export function getRandomItem<T>(array: T[]): T {
    if (!array || array.length < 1) { return null; }
    return array[rndIndex(array)];
}

export function removeItem(array: any[], item: number) {
    const index = array.indexOf(item);
    if (index >= 0) {
        array.splice(index, 1);
    }
    return index;
}

export function getAngleDiff(a1: number, a2: number) {
    let dif = (a2 - a1) % (2 * Math.PI);
    if (dif < -Math.PI) {
        dif += 2*Math.PI;
    } else if (dif > Math.PI) {
        dif -= 2*Math.PI;
    }
    return dif;
}

export function mapRange(number: number, min1: number, max1: number, min2: number, max2: number) {
    return (number - min1) * (max2 - min2) / (max1 - min1) + min2;
}

export function nearly(n1: number, n2: number, range: number = 2): boolean {
    return Math.abs(n1 - n2) < range
}

export function nearlyColor(c1: number[], c2: number[], range = 4): boolean {
    return nearly(c1[0], c2[0], range) && nearly(c1[1], c2[1], range) && nearly(c1[2], c2[2], range);
}

export function sameColor(c1: number[], c2: number[]): boolean {
    return c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2] && c1[3] === c2[3];
}

export function getRelativeMouseCoordinates(event: MouseEvent, relativeTo: HTMLElement = event.target as HTMLElement) {
    // TODO throw an error if getBoundingClientRect is not available
    const rect = relativeTo.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return [x, y];
}

export function rnd(vMinOrMax?: number, vMax?: number) {
    if (vMinOrMax == null) {
        return Math.random();
    } else if (vMax == null) {
        return Math.random() * vMinOrMax;
    } else {
        return vMinOrMax + Math.random() * (vMax - vMinOrMax);
    }
}

export function rndInt(vMinOrMax: number, vMax?: number) {
    if (vMax == null) {
        return Math.floor(Math.random() * vMinOrMax);
    } else {
        return vMinOrMax + Math.floor(Math.random() * (vMax - vMinOrMax));
    }
}

export function wobble(t: number, speedFactor = 1, offset = 0, power = 1) {
    t *= speedFactor + offset;
    let v = (Math.sin(t) + Math.sin(t * 0.7934) + Math.sin(t * 0.31532) + Math.sin(t*0.23543)) * 0.25;
    if (power != 1) {
        v = sgnPow(v, power);
    }
    return v;
}

export function sgnPow(value: number, exponent: number) {
    if (value < 0) {
        return -Math.pow(-value, exponent);
    } else {
        return Math.pow(value, exponent);
    }
}

export function absMod(v: number, modulus: number) {
    v = v % modulus;
    return (v < 0) ? v + modulus : v;
}

export function reverseForEach<T>(array: Array<T>, callback: (t: T, i: number) => void): void {
    let index = array.length - 1;
    while (index >= 0) {
        callback(array[index], index);
        index--;
    }
}

export function multiplyColor(color: number[], fr: number, fg = fr, fb = fg): number[] {
    const result = [ color[0] * fr, color[1] * fg, color[2] * fb ];
    if (color.length > 3) { result.push(color[3]); }
    return result;
}

export function isDev(): boolean {
    return window.location.hostname.includes("localhost");
}
