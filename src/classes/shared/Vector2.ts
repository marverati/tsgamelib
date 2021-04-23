import { exposeToWindow } from "../../util";

export default class Vector2 {
    public constructor(public readonly x = 0, public readonly y = 0) {}

    public getLength(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public isNull(): boolean {
        return this.x === 0 && this.y === 0;
    }

    public isLongerThan(l: number): boolean {
        return this.x * this.x + this.y * this.y > l * l;
    }

    public isShorterThan(l: number): boolean {
        return this.x * this.x + this.y * this.y < l * l;
    }

    public add(other: Vector2): Vector2;
    public add(dx: number, dy: number): Vector2;
    public add(dxOrOther: Vector2 | number, dy?: number) {
        if (dxOrOther instanceof Vector2) {
            return new Vector2(this.x + dxOrOther.x, this.y + dxOrOther.y);
        } else {
            return new Vector2(this.x + dxOrOther, this.y + dy);
        }
    }
    
    public sub(other: Vector2): Vector2;
    public sub(dx: number, dy: number): Vector2;
    public sub(dxOrOther: Vector2 | number, dy?: number) {
        if (dxOrOther instanceof Vector2) {
            return new Vector2(this.x - dxOrOther.x, this.y - dxOrOther.y);
        } else {
            return new Vector2(this.x - dxOrOther, this.y - dy);
        }
    }

    public scale(fx: number, fy = fx): Vector2 {
        return new Vector2(this.x * fx, this.y * fy);
    }

    public normalize(length = 1): Vector2 {
        const f = length / this.getLength();
        return this.scale(f);
    }

    public invert(): Vector2 {
        return this.scale(-1);
    }

    public dot(other: Vector2): number {
        return this.x * other.x + this.y * other.y;
    }

    public isSameDirection(other: Vector2): boolean {
        return this.dot(other) > 0;
    }

    public cross(other: Vector2): number {
        return this.x * other.y - this.y * other.x;
    }

    public setX(x: number): Vector2 {
        return new Vector2(x, this.y);
    }

    public setY(y: number): Vector2 {
        return new Vector2(this.x, y);
    }

    public set(x = 0, y = 0): Vector2 {
        return new Vector2(x, y);
    }

    public blend(other: Vector2, f = 0.5): Vector2 {
        const f1 = 1 - f;
        return new Vector2(f * other.x + f1 * this.x, f * other.y + f1 * this.y);
    }
}

exposeToWindow({ Vector2 });