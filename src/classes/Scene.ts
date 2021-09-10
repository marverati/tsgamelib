import Game from "./Game";
import KeyHandler from "./KeyHandler";
import Loader from "./Loader";
import MouseHandler from "./MouseHandler";
import SceneManager, { FadeMode } from "./SceneManager";


export default abstract class Scene {
    protected manager: SceneManager | null = null;
    protected keyHandler: KeyHandler;
    protected mouseHandler: MouseHandler;
    private time = 0;

    public constructor(public readonly name: string) {
    }

    public setManager(manager: SceneManager) {
        this.manager = manager;
    }

    public getKeyHandler() {
        return this.keyHandler;
    }

    public getMouseHandler() {
        return this.mouseHandler;
    }

    /** Note: when implementing load method, make sure to add @loadMedia decorator to your scene class */
    public load(loader: Loader) {}

    public draw(ctx: CanvasRenderingContext2D, opacity: number, time: number, dt: number): void {
    }

    public updateInternal(dt: number, time: number, keyHandler: KeyHandler, mouseHandler: MouseHandler) {
        this.time = time;
        this.mouseHandler = mouseHandler;
        this.keyHandler = keyHandler;
        this.update(dt, time);
    }

    public update(dt: number, time: number) {}

    public getGame() {
        if (this.manager && this.manager.game) {
            return this.manager.game;
        } else {
            return Game.getInstance();
        }
    }

    public hasControl() {
        return !this.manager || this.manager.isSceneActive(this);
    }

    public getTime(): number {
        return this.time;
    }

    // *** Scene Customization ***

    public scaleDtWithOpacity() {
        return true;
    }

    public getOpacityInterpolation(p: number): number {
        return 0.5 - 0.5 * Math.cos(Math.PI * p);
    }

    // *** Transitions ***
    public fadeTo(scene: string | Scene, duration?: number | null, fadeMode?: FadeMode): Promise<void> {
        if (this.manager && this.hasControl()) {
            return this.manager.switchTo(scene, duration, fadeMode);
        }
        return Promise.reject();
    }

    public fadeOnTop(scene: string | Scene, duration?: number): Promise<void> {
        if (this.manager && this.hasControl()) {
            return this.manager.openOnTop(scene, duration);
        }
        return Promise.reject();
    }

    public fadeOut(duration?: number): Promise<void> {
        if (this.manager && this.hasControl()) {
            return this.manager.fadeOut(this, duration);
        }
        return Promise.reject();
    }

    // *** Lifecycle hooks ***
    public onStart() {}

    public onFadedIn() {}

    public onFadeOut() {}

    public onEnd() {}

}
