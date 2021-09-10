import { getRelativeMouseCoordinates } from "./shared/util";

/**
 * The MouseHandler allows querying the mouse state at any point, including its key states as well as coordinates.
 * Coordinates can be queried relative to several coordinate systems:
 * - relative to canvas, in screen pixels (getCanvasPos)
 * - relative to canvas, in canvas resolution (getScreenPos)
 * - relative to canvas, between 0 and 1 in both dimensions (getRelativeCanvasPos)
 * - relative to game world, if setCanvasTransform is updated accordingly when world cam is moved (getWorldPos)
 */
export default class MouseHandler {

    private target: HTMLElement = null;

    private mouse = {
        click: 0,
        absX: 0,
        absY: 0,
        canvasX: 0,
        canvasY: 0,
        x: 0,
        y: 0,
    }

    private transform = {
        offX: 0,
        offY: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        rotationCos: 1, // = Cos 0°
        rotationSin: 0, // = Sin 0°
    };

    constructor(target: HTMLElement = document.body) {
        this.target = target;
        this.registerEvents(document.body);
    }

    public setTarget(target: HTMLElement) {
        this.target = target;
    }

    public get() {
        return this.mouse;
    }

    public getWorldPos() {
        return [ this.mouse.x, this.mouse.y ];
    }

    public getCanvasPos() {
        return [ this.mouse.absX, this.mouse.absY ];
    }

    public getScreenPos() {
        return [ this.mouse.canvasX, this.mouse.canvasY ];
    }

    public getRelativeCanvasPos() {
        return [ this.mouse.absX / this.target.clientWidth, this.mouse.absY / this.target.clientHeight ];
    }

    public getDown() {
        return this.mouse.click;
    }

    protected registerEvents(target: HTMLElement): void {
        target.addEventListener('mousedown', this.handleMouseDown.bind(this));
        target.addEventListener('mouseup', this.handleMouseUp.bind(this));
        target.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    private setMouseCoordinates(event: MouseEvent) {
        const relativeMouseCoordinates = getRelativeMouseCoordinates(event, this.target);
        this.mouse.absX = relativeMouseCoordinates[0];
        this.mouse.absY = relativeMouseCoordinates[1];
        this.mouse.canvasX = relativeMouseCoordinates[0] * (this.target as HTMLCanvasElement).width / this.target.offsetWidth;
        this.mouse.canvasY = relativeMouseCoordinates[1] * (this.target as HTMLCanvasElement).height / this.target.offsetHeight;
        [this.mouse.x, this.mouse.y] = this.transformCoordinates(this.mouse.canvasX, this.mouse.canvasY);
    }

    public setCanvasTransform = function (offX = 0, offY = 0, scaleX = 1, scaleY = scaleX, rotation = 0, invert = true) {
        if (!invert) {
            // Simply apply transformation
            this.transform.offX = offX;
            this.transform.offY = offY;
            this.transform.scaleX = scaleX;
            this.transform.scaleY = scaleY;
            this.transform.rotation = rotation;
        } else {
            // Reverse transformation
            this.transform.offX = -offX;
            this.transform.offY = -offY;
            this.transform.scaleX = 1 / scaleX;
            this.transform.scaleY = 1 / scaleY;
            this.transform.rotation = -rotation;
        }
        this.transform.rotationSin = Math.sin(rotation);
        this.transform.rotationCos = Math.cos(rotation);
    }

    private transformCoordinates(x: number, y: number): [number, number] {
        // Offset
        x += this.transform.offX;
        y += this.transform.offY;
        // Scale
        x *= this.transform.scaleX;
        y *= this.transform.scaleY;
        // Rotate and return
        return [
            this.transform.rotationCos * x - this.transform.rotationSin * y,
            this.transform.rotationSin * x + this.transform.rotationCos * y
        ];
    }

    private handleMouseMove(event: MouseEvent) {
        this.setMouseCoordinates(event);
    }

    private handleMouseDown(event: MouseEvent) {
        this.mouse.click = 1;
        this.setMouseCoordinates(event);
    }

    private handleMouseUp(event: MouseEvent) {
        this.mouse.click = 0;
        this.setMouseCoordinates(event);
    }
}

export class FakeMouseHandler extends MouseHandler {
    protected registerEvents(target: HTMLElement): void {}
}