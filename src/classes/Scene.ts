import KeyHandler from "./KeyHandler";
import Loader from "./Loader";
import MouseHandler from "./MouseHandler";
import SceneManager from "./SceneManager";
import SceneObject from "./SceneObject";


export default abstract class Scene {
    protected manager: SceneManager | null = null;
    protected sceneObjects: SceneObject[] = [];
    protected keyHandler: KeyHandler;
    protected mouseHandler: MouseHandler;

    public constructor(public readonly name: string) {
    }

    public setManager(manager: SceneManager) {
        this.manager = manager;
    }

    public register(obj: SceneObject): void {
        // TODO evaluate whether this hurts performance
        if (!this.sceneObjects.includes(obj)) {
            this.sceneObjects.push(obj);
        }
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
        // Draw content
        for (const obj of this.sceneObjects) {
            obj.draw(ctx, time, dt);
        }
    }

    public updateInternal(dt: number, time: number, keyHandler: KeyHandler, mouseHandler: MouseHandler) {
        this.mouseHandler = mouseHandler;
        this.keyHandler = keyHandler;
        this.update(dt, time);
        // Update content
        for (const obj of this.sceneObjects) {
            obj.update(dt, time);
        }
    }

    public update(dt: number, time: number) {}

    public getGame() {
        return this.manager.game;
    }

    public hasControl() {
        return !this.manager || this.manager.isSceneActive(this);
    }

    // *** Scene Customization ***

    public scaleDtWithOpacity() {
        return true;
    }

    public getOpacityInterpolation(p: number): number {
        return 0.5 - 0.5 * Math.cos(Math.PI * p);
    }

    // *** Transitions ***
    public fadeTo(scene: string | Scene, duration?: number): Promise<void> {
        if (this.manager && this.hasControl()) {
            return this.manager.switchTo(scene, duration);
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