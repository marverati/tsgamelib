import { clamp } from "../util";
import ControlsHandler from "./game/ControlsHandler";
import KeyHandler from "./KeyHandler";
import Level from "./game/Level";
import Player from "./game/Player";

const MAX_DT = 80;

const FAKE_LOW_FPS = false;
const LOW_FPS_FRAME_DELAY = 100;

export default class Game {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private level: Level | null = null;
    public readonly keyHandler = new KeyHandler();
    public readonly controls = new ControlsHandler();

    private lastTime = performance.now();
    private appTime = 0;
    private gameTimeSpeed = 1;
    private gameTime = 0;
    private gameDt = 0;
    private fpsTimestamps: number[] = [];
    private currentFps = 0;
    private showFps = true;

    constructor(canvas: string | HTMLCanvasElement) {
        if (typeof canvas === "string") {
            canvas = document.getElementById(canvas) as HTMLCanvasElement;
        }
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");

        setTimeout(() => this.update(), 0);
        setTimeout(() => this.draw(), 0);
    }

    public update(): void {
        // General time handling
        const t = performance.now()
        const dt = clamp(t - this.lastTime, MAX_DT);
        const lastTime = this.lastTime;
        this.lastTime = t;
        this.appTime += dt;
        this.gameDt = dt * this.gameTimeSpeed * 0.001;
        this.gameTime += this.gameDt;
        this.handleFps(t, lastTime);

        // Controls
        this.keyHandler.update(t);
        this.controls.update(this.gameDt, this.gameTime);
        // Update game content
        if (this.level) {
            this.level.update(this.gameDt, this.gameTime);
        }

        if (!FAKE_LOW_FPS) {
            requestAnimationFrame(() => this.update());
        } else {
            setTimeout(() => this.update(), LOW_FPS_FRAME_DELAY);
        }
    }

    public draw(): void {
        // Clear
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Camera
        this.controls.updateCamera(this.context);

        // Draw level
        if (this.level) {
            this.level.draw(this.context, this.gameTime, this.gameDt);
        }

        // FPS counter
        if (this.showFps) {
            this.context.save();
            this.context.setTransform(1, 0, 0, 1, 0, 0);
            this.context.fillStyle = "red";
            this.context.textBaseline = "top";
            this.context.font = "20px Arial";
            this.context.fillText("" + this.currentFps, 5, 5);
            this.context.restore();
        }

        requestAnimationFrame(() => this.draw());
    }

    // TODO get rid of explicit level reference
    public setLevel(level: Level): void {
        this.level = level;
        // Take control over all Players
        const players = level.getCharacters().filter(c => c instanceof Player);
        this.controls.setPlayers(players[0] ?? null, players[1] ?? null);
    }

    private handleFps(time: number, lastTime: number) {
        this.fpsTimestamps.push(time);
        // find earliest timestamp from last second
        const minimumTime = time - 1000;
        const firstIndex = this.fpsTimestamps.findIndex(t => t >= minimumTime);
        if (firstIndex > 0) {
            this.fpsTimestamps.splice(0, firstIndex);
        }
        // Update FPS counter once per second
        if (Math.floor(time / 1000) > Math.floor(lastTime / 1000)) {
            this.currentFps = this.fpsTimestamps.length;
        }
    }
}