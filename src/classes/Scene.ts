import KeyHandler from "./KeyHandler";
import Loader from "./Loader";
import SceneManager from "./SceneManager";
import SceneObject from "./SceneObject";


export default abstract class Scene {
    protected manager: SceneManager | null = null;
    protected sceneObjects: SceneObject[] = [];
    protected keyHandler: KeyHandler;

    public constructor(public readonly name: string) {
    }

    public setManager(manager: SceneManager) {
        this.manager = manager;
    }

    public register(obj: SceneObject): void {
        // TODO evaluate whether this hurts performance
        console.log("REGGED ", obj);
        if (!this.sceneObjects.includes(obj)) {
            this.sceneObjects.push(obj);
        }
    }

    /** Note: when implementing load method, make sure to add @loadMedia decorator to your scene class */
    public load(loader: Loader) {}

    public draw(ctx: CanvasRenderingContext2D, opacity: number, time: number, dt: number): void {
        // Draw content
        for (const obj of this.sceneObjects) {
            obj.draw(ctx, time, dt);
        }
    }

    public update(dt: number, time: number, keyHandler: KeyHandler) {
        this.keyHandler = keyHandler;
        // Update content
        for (const obj of this.sceneObjects) {
            obj.update(dt, time);
        }
    }


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