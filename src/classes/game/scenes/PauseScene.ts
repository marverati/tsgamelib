
import Scene, { ScenePayload } from "../../Scene";

export default class PauseScene extends Scene {

    public constructor() {
        super("PauseScene");
    }

    public onStart(payload?: ScenePayload) {
    }

    public draw(ctx: CanvasRenderingContext2D, opacity: number, time: number, dt: number): void {
        ctx.globalAlpha = opacity;
        ctx.fillStyle = `rgba(0, 0, 0, 0.7)`;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // Title
        const xm = ctx.canvas.width / 2, ym = ctx.canvas.height / 2;
        ctx.fillStyle = "white";
        ctx.font = "32px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Paused", xm, ym);
    }

    public update() {
        if (this.getKeyHandler().getDown("Escape") && this.hasControl()) {
            this.fadeOut(0.25);
        }
    }

}