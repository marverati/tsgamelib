import { exposeToWindow } from "../../util";
import Vector2 from "./Vector2";

export default class Rect {
    protected x: number;
    protected y: number;
    protected x2: number;
    protected y2: number;
    public constructor(protected x1: number, protected y1: number, protected w: number, protected h: number) {
        this.x2 = x1 + w;
        this.y2 = y1 + h;
        this.x = (x1 + this.x2) / 2;
        this.y = (y1 + this.y2) / 2;
    }

    public clone(): Rect {
        return new Rect(this.x1, this.y1, this.w, this.h);
    }

    public static fromCentered(x: number, y: number, w: number, h: number): Rect {
        return new Rect(x - w / 2, y - h / 2, w, h);
    }

    public contains(point: Vector2): boolean;
    public contains(x: number, y: number): boolean;
    public contains(arg1: Vector2 | number, y?: number): boolean {
        if (arg1 instanceof Vector2) {
            return this.contains(arg1.x, arg1.y);
        } else {
            return arg1 >= this.x1 && y >= this.y1 && arg1 < this.x2 && y < this.y2;
        }
    }

    public overlaps(other: Rect): boolean {
        return this.x1 < other.x2 && this.y1 < other.y2 && this.x2 > other.x1 && this.y2 > other.y1;
    }

    public move(dx: number, dy: number): this {
        return this.setCenter(this.x + dx, this.y + dy);
    }

    public setCenter(x: number, y: number): this {
        this.x = x; 
        this.y = y;
        this.x1 = x - this.w / 2;
        this.y1 = y - this.h / 2;
        this.x2 = this.x1 + this.w;
        this.y2 = this.y1 + this.h;
        return this;
    }

    public setSize(w: number, h: number): this {
        this.w = w;
        this.h = h;
        this.x1 = this.x - w / 2;
        this.y1 = this.y - h / 2;
        this.x2 = this.x1 + w;
        this.y2 = this.y1 + h;
        return this;
    }

    public set(x1: number, y1: number, w: number = this.w, h: number = this.h) {
        this.x1 = x1;
        this.y1 = y1;
        this.w = w;
        this.h = h;
        this.x2 = x1 + w;
        this.y2 = y1 + h;
        this.x = (x1 + this.x2) / 2;
        this.y = (y1 + this.y2) / 2;
    }

    public getSize(): Vector2 {
        return new Vector2(this.w, this.h);
    }

    public getCenter(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    public getTopLeft(): Vector2 {
        return new Vector2(this.x1, this.y1);
    }

    public getArea(): number {
        return this.w * this.h;
    }

    public getAspectRatio(): number {
        return this.w / this.h;
    }
}


exposeToWindow({ Rect });