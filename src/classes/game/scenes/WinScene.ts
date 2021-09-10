import Scene from "../../Scene";

const AUTO_SKIP = true;
export default class WinScene extends Scene {

    public constructor() {
        super("WinScene");
    }

    public load() {}

    public draw(ctx: CanvasRenderingContext2D, opacity: number, time: number, dt: number): void {
        ctx.translate(0, -400 * (1 - opacity));
        ctx.fillStyle = "black";
        ctx.globalAlpha = opacity;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "32px Arial";
        ctx.textAlign = "center";
        ctx.fillText("You Win!", ctx.canvas.width / 2, ctx.canvas.height / 2);
    }

}