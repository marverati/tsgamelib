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
    private timeouts: SceneTimeout[] = [];

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

    public getMusicManager() {
        return this.getGame().musicManager;
    }

    public setTimeout(callback: Function, delayInSeconds = 0): number {
        const timeout = new SceneTimeout(callback, this.getTime(), delayInSeconds, false);
        this.timeouts.push(timeout);
        return timeout.id;
    }

    public setInterval(callback: Function, delayInSeconds: number, triggerCount?: number): number {
        const timeout = new SceneTimeout(callback, this.getTime(), delayInSeconds, true);
        if (triggerCount) { timeout.setTriggerCount(triggerCount); }
        this.timeouts.push(timeout);
        return timeout.id;
    }

    public clearTimeout(id: number): boolean {
        const index = this.timeouts.findIndex(t => t.id === id);
        if (index) {
            this.timeouts.splice(index, 1);
            return true;
        }
        return false;
    }

    public clearAllTimeouts(): void {
        this.timeouts = [];
    }

    /** Note: when implementing load method, make sure to add @loadMedia decorator to your scene class */
    public static load(loader: Loader) {}

    public draw(ctx: CanvasRenderingContext2D, opacity: number, time: number, dt: number): void {
    }

    public updateInternal(dt: number, time: number, keyHandler: KeyHandler, mouseHandler: MouseHandler) {
        this.time = time;
        this.mouseHandler = mouseHandler;
        this.keyHandler = keyHandler;
        this.updateTimeouts(dt, time);
        this.update(dt, time);
    }

    private updateTimeouts(dt: number, time: number) {
        for (let i = this.timeouts.length - 1; i >= 0; i--) {
            const remove = this.timeouts[i].update(time);
            if (remove) {
                this.timeouts.splice(i, 1);
            }
        }
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


let timeoutCounter = 0;

class SceneTimeout {
    public id: number;
    public delay: number;
    public triggerTime: number;
    public callback: Function;
    private triggerCount = 0;
    private maxTriggerCount = Infinity;

    public constructor(callback: Function, time: number, delay: number, isInterval = false) {
        this.callback = callback;
        this.delay = delay;
        this.triggerTime = time + delay;
        this.id = timeoutCounter++;
        this.maxTriggerCount = isInterval ? Infinity : 1;
    }

    public setTriggerCount(count: number) {
        this.maxTriggerCount = count;
    }

    public update(time: number) {
        if (time >= this.triggerTime) {
            const remove = this.callback(this.triggerCount++);
            if (this.triggerCount >= this.maxTriggerCount || remove && remove === 'REMOVE') {
                return true;
            } else {
                // Trigger again in future
                this.triggerTime += this.delay;
                if (this.triggerTime <= time) {
                    this.triggerTime = time + this.delay;
                }
            }
        }
        return false;
    }
}