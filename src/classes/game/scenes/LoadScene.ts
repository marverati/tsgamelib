
import Scene, { ScenePayload } from "../../Scene";

export default class LoadScene extends Scene {
    private doneTime = Infinity;
    private title = "Loading..." // potentially overwritten in onStart

    public constructor() {
        super("LoadScene");
    }

    public onStart(payload?: ScenePayload) {
        this.getGame().loader.loadAll().then(() => this.doneTime = Math.max(0.8, this.getTime()))
        this.title = (payload as any)?.title ?? "Loading...";
    }

    public draw(ctx: CanvasRenderingContext2D, opacity: number, time: number, dt: number): void {
        ctx.globalAlpha = opacity;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const x1 = ctx.canvas.width * 0.2, y1 = ctx.canvas.height * 0.485;
        const x2 = ctx.canvas.width - x1, y2 = ctx.canvas.height - y1;
        // Title
        if (this.title) {
            ctx.fillStyle = "white";
            ctx.font = "32px Arial";
            ctx.textAlign = "center";
            ctx.fillText(this.title, (x1 + x2) / 2, y1 - 36);
        }
        // Loading bar border
        ctx.strokeStyle = "white";
        ctx.strokeRect(x1 - 3, y1 - 3, x2 - x1 + 6, y2 - y1 + 6);
        // Loading bar progress
        ctx.fillStyle = "#ccc";
        const progress = this.getGame().loader.getProgress();
        ctx.fillRect(x1, y1, (x2 - x1) * progress, y2 - y1);
    }

    public update() {
        if (this.getTime() >= this.doneTime && this.hasControl()) {
            this.fadeTo("GameScene");
        }
    }

}