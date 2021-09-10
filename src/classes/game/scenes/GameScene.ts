import KeyHandler from "../../KeyHandler";
import Scene from "../../Scene";
import { exposeToWindow } from "../../shared/util";
import ControlsHandler from "../ControlsHandler";
import Level from "../Level";
import Player from "../Player";


export default class GameScene extends Scene {
    public keyHandler: KeyHandler;
    private camTransform: number[] | DOMMatrix = new DOMMatrix();
    private controls: ControlsHandler = null;
    private level: Level = null;
    private players: Player[] = [];

    public constructor() {
        super("GameScene");
        exposeToWindow({gameScene: this});
    }

    public setLevel(level: Level) {
        this.level = level;
        const players = level.getCharacters().filter(c => c instanceof Player);
        this.players = players;
        const controls = new ControlsHandler(this);
        controls.setPlayers(players[0] ?? null, players[1] ?? null);
        this.controls = controls;
        exposeToWindow({level});
    }

    public load() {}

    public draw(ctx: CanvasRenderingContext2D, opacity: number, time: number, dt: number): void {
        if (opacity < 1) {
            ctx.beginPath();
            ctx.rect(0, 0, ctx.canvas.width * opacity, ctx.canvas.height);
            ctx.clip();
        }

        // Camera
        ctx.save();
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

        this.level?.draw(ctx, time, dt);

        ctx.restore();

        // UI
        ctx.fillStyle = "darkgreen";
        ctx.font = "20px Arial";
        const worldPos = this.mouseHandler.getWorldPos();
        const screenPos = this.mouseHandler.getScreenPos();
        const coords = (worldPos[0] << 0) + "," + (worldPos[1] << 0);
        ctx.fillText(coords, screenPos[0], screenPos[1]);

    }

    public update(dt: number, time: number) {
        this.level?.update(dt, time);
        this.controls.update(dt, time);
    }

    public setCamera(camTransform: number[] | DOMMatrix) {
        this.camTransform = camTransform;
    }

}