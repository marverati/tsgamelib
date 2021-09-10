import Scene from "../../Scene";

const AUTO_SKIP = false;
export default class VeryFirstScene extends Scene {

    public constructor() {
        super("VeryFirstScene");
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
        ctx.fillText("Press Enter to Start", ctx.canvas.width / 2, ctx.canvas.height / 2);
    }

    public update(dt: number, time: number) {
        if (this.keyHandler.getDown("Enter") || AUTO_SKIP && time > 0.5) {
            if (this.hasControl()) {
                this.fadeTo("LoadScene");
            }
        }
    }

}