import SceneObject from "../../SceneObject";
import KeyHandler from "../../KeyHandler";
import Scene from "../../Scene";


export default class GameScene extends Scene {
    public keyHandler: KeyHandler;
    private camTransform: number[] | DOMMatrix = new DOMMatrix();

    public constructor() {
        super("GameScene");
    }

    public load() {}

    public draw(ctx: CanvasRenderingContext2D, opacity: number, time: number, dt: number): void {
        if (opacity < 1) {
            ctx.beginPath();
            ctx.rect(0, 0, ctx.canvas.width * opacity, ctx.canvas.height);
            ctx.clip();
        }

        // Camera
        const t = this.camTransform;
        if (t instanceof DOMMatrix) {
            ctx.setTransform(t);
        } else {
            ctx.setTransform(t[0], t[1], t[2], t[3], t[4], t[5]);
        }

        if (opacity < 1) {
            ctx.translate(-ctx.canvas.width * (1 - opacity), 0);
        }

        super.draw(ctx, opacity, time, dt);

    }

    public update(dt: number, time: number, keyHandler: KeyHandler) {
        super.update(dt, time, keyHandler);
    }

    public setCamera(camTransform: number[] | DOMMatrix) {
        this.camTransform = camTransform;
    }

}