import { clamp, isDev } from "./shared/util";
import KeyHandler from "./KeyHandler";
import Loader from "./Loader";
import MouseHandler from "./MouseHandler";
// import { SoundManager } from "./SoundManager";
import SceneManager from "./SceneManager";
import { BitmapFont } from "./BitmapFont";
import { Fonts } from "./Loader";
import MusicManager from "./MusicManager";

const MAX_DT = 80;

const FAKE_LOW_FPS = false;
const LOW_FPS_FRAME_DELAY = 100;

export function loadMedia(target: Loadable) {
    target.load(Game.getInstance().loader);
}

export interface Loadable {
    load: (loader: Loader) => void;
}

const CanvasDimensions = {
    width: 320,
    height: 200
}

export default class Game {
    private static theInstance: Game = new Game();

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    public isPaused = false;

    public readonly sceneManager = new SceneManager(this);
    public readonly keyHandler = new KeyHandler();
    public readonly mouseHandler = new MouseHandler();
    public readonly musicManager = new MusicManager();
    // public readonly soundManager = SoundManager.getInstance();

    public readonly loader = new Loader();

    private lastTime = performance.now();
    private appTime = 0;
    private gameTimeSpeed = 1;
    private gameTime = 0;
    private gameDt = 0;
    private fpsTimestamps: number[] = [];
    private currentFps = 0;
    private showFps = isDev();
    private boundUpdate: FrameRequestCallback;
    private boundDraw: FrameRequestCallback;
    static standardFont?: BitmapFont;
    static headlineFont?: BitmapFont;

    private constructor() {
        setTimeout(() => this.update(), 0);
        setTimeout(() => this.draw(), 0);
        this.boundUpdate = this.update.bind(this);
        this.boundDraw = this.draw.bind(this);
        this.loader.loadFont(Fonts.STANDARD_FONT).then(font => Game.standardFont = font);
        this.loader.loadFont(Fonts.HEADLINE_FONT).then(font => Game.headlineFont = font);
    }

    public static getInstance(): Game {
        return Game.theInstance;
    }

    public setCanvas(canvas: string | HTMLCanvasElement): void {
        if (typeof canvas === "string") {
            canvas = document.getElementById(canvas) as HTMLCanvasElement;
        }
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.mouseHandler.setTarget(this.canvas);
        window.addEventListener("resize", () => this.updateCanvasSize());
        this.updateCanvasSize();
         // Use Alt+Enter to toggle fullscreen mode.
        window.addEventListener("keydown", async (event) => {
            if (event.altKey && event.key === "Enter") {
                const lockingEnabled = "keyboard" in navigator && "lock" in navigator.keyboard && typeof navigator.keyboard.lock === "function";
                // If the browser is in full screen mode AND fullscreen has been triggered by our own keyboard shortcut...
                if (window.matchMedia("(display-mode: fullscreen)").matches && document.fullscreenElement != null) {
                    if (lockingEnabled) {
                        navigator.keyboard.unlock();
                    }
                    await document.exitFullscreen();
                } else {
                    if (lockingEnabled) {
                        await navigator.keyboard.lock(["Escape"]);
                    }
                    await document.body.requestFullscreen();
                }
            }
        });
    }

    private updateCanvasSize(): void {
        if (!this.canvas) {
            return;
        }
        const { width, height } = CanvasDimensions;

        const scale = Math.max(
            1,
            Math.floor(Math.min(window.innerWidth / width, window.innerHeight / height))
        );

        this.canvas.style.width = width * scale + "px";
        this.canvas.style.height = height * scale + "px";
    }

    public getCanvas(): HTMLCanvasElement | null {
        return this.canvas;
    }

    public getAppTime(): number {
        return this.appTime;
    }

    public getGameTime(): number {
        return this.gameTime;
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
        this.sceneManager.update(this.gameDt, t);
        this.musicManager.update(this.gameDt, t);

        if (!FAKE_LOW_FPS) {
            requestAnimationFrame(this.boundUpdate);
        } else {
            setTimeout(this.boundUpdate, LOW_FPS_FRAME_DELAY);
        }
    }

    public draw(): void {
        if (this.context != null) {
            // Clear
            this.context.fillStyle = "black";
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.sceneManager.draw(this.context, this.gameTime, this.gameDt);

            // FPS counter
            if (this.showFps) {
                this.context.save();
                this.context.setTransform(1, 0, 0, 1, 0, 0);
                Game.standardFont?.drawText(this.context, "" + this.currentFps, 5, 5, "green");
                this.context.restore();
            }
        }

        requestAnimationFrame(this.boundDraw);
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
