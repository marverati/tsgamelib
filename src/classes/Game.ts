import { clamp } from "../util";
import KeyHandler from "./KeyHandler";
import GameObject from "./GameObject";
import Loader from "./Loader";

const MAX_DT = 80;

const FAKE_LOW_FPS = false;
const LOW_FPS_FRAME_DELAY = 100;

export function loadMedia(gameObjectClass: Loadable): void {
    Game.getInstance().loadMedia(gameObjectClass);
}

interface Loadable {
    load: (loader: Loader) => void;
}
export default class Game {
    private static theInstance: Game = new Game();

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    public readonly keyHandler = new KeyHandler();

    public readonly loader = new Loader();
    private camTransform: number[] | DOMMatrix = new DOMMatrix();

    private lastTime = performance.now();
    private appTime = 0;
    private gameTimeSpeed = 1;
    private gameTime = 0;
    private gameDt = 0;
    private fpsTimestamps: number[] = [];
    private currentFps = 0;
    private showFps = true;

    private gameObjects: GameObject[] = [];

    private constructor() {
        setTimeout(() => this.update(), 0);
        setTimeout(() => this.draw(), 0);
    }

    public static getInstance(): Game {
        return Game.theInstance;
    }

    public register(obj: GameObject): void {
        // TODO evaluate whether this hurts performance
        if (!this.gameObjects.includes(obj)) {
            this.gameObjects.push(obj);
        }
    }

    public loadMedia(obj: Loadable): void {
        obj.load(this.loader);
    }

    public setCanvas(canvas: string | HTMLCanvasElement): void {
        if (typeof canvas === "string") {
            canvas = document.getElementById(canvas) as HTMLCanvasElement;
        }
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
    }

    public getCanvas(): HTMLCanvasElement | null {
        return this.canvas;
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


        this.keyHandler.update(t);

        // Update game content
        for (const obj of this.gameObjects) {
            obj.update(this.gameDt, this.gameTime);
        }

        if (!FAKE_LOW_FPS) {
            requestAnimationFrame(() => this.update());
        } else {
            setTimeout(() => this.update(), LOW_FPS_FRAME_DELAY);
        }
    }

    public draw(): void {
        if (this.context != null) {
            // Clear
            this.context.fillStyle = "black";
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
            // Camera
            const t = this.camTransform;
            if (t instanceof DOMMatrix) {
                this.context.setTransform(t);
            } else {
                this.context.setTransform(t[0], t[1], t[2], t[3], t[4], t[5]);
            }
    
            // Draw game content
            for (const obj of this.gameObjects) {
                obj.draw(this.context, this.gameTime, this.gameDt);
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
        }

        requestAnimationFrame(() => this.draw());
    }

    public setCamera(camTransform: number[] | DOMMatrix) {
        this.camTransform = camTransform;
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