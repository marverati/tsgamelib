import { clamp } from "./shared/util";
import Game from "./Game";
import { FakeKeyHandler } from "./KeyHandler";
import { FakeMouseHandler } from "./MouseHandler";
import Scene from "./Scene";

type SceneData = {
    fadeDirection: number; // -1 when fading out, 0 for nothing, 1 when fading in
    fadeDuration: number; // Duration of current fade, in seconds
    opacity: number; // value between 0 and 1 representing current fade state
    time: number; // scene time
    dt: number; // scene dt of current frame
    resolver: Function | null; // Promise resolve executed as soon as scene fades out
    fadeOutResolver: Function | null; // Promise resolve executed as soon as a single FadeOut has been executed
}

export enum FadeMode {
    CROSS = "cross",
    AFTER = "after",
    IN = "in"
};

const DEFAULT_TRANSITION_DURATION = 0.5;

export default class SceneManager {
    /** List of all registered scenes. Should be one instance of every implemented scene type. */
    private allScenes: Scene[] = [];
    /** List of all currently alive scenes. These will be rendered in order. */
    private scenes: Scene[] = [];
    /** Single scene that has key and mouse focus at any given time. Or null if none. */
    private focusedScene: Scene | null = null;

    private sceneData: Map<Scene, SceneData> = new Map<Scene, SceneData>();

    private fakeKeyHandler = new FakeKeyHandler();
    private fakeMouseHandler = new FakeMouseHandler();

    public constructor(public readonly game: Game) {
    }

    public update(dt: number, time: number) {
        this.scenes = this.allScenes.filter(scene => {
            const data = this.getData(scene);
            return data.opacity > 0 || data.fadeDirection > 0 ;
        });
        for (const scene of this.scenes) {
            const data = this.getData(scene);
            if (data.fadeDirection !== 0) {
                data.opacity += dt * data.fadeDirection / data.fadeDuration;
                if (data.fadeDirection > 0) {
                    // Fade in
                    if (data.opacity >= 1) {
                        data.opacity = 1;
                        data.fadeDirection = 0;
                        scene.onFadedIn();
                    }
                } else {
                    // Fade out
                    if (data.opacity <= 0) {
                        data.opacity = 0;
                        data.fadeDirection = 0;
                        this.disableNow(scene);
                        scene.onEnd();
                        data.fadeOutResolver && data.fadeOutResolver();
                        continue;
                    }
                }
            }
            const sceneDt = scene.scaleDtWithOpacity() ? dt * clamp(data.opacity, 0, 1) : dt;
            if (!this.game.isPaused) {
                data.dt = sceneDt;
                data.time += sceneDt;
            }
            const keyHandler = (scene === this.focusedScene) ? this.game.keyHandler : this.fakeKeyHandler;
            const mouseHandler = (scene === this.focusedScene) ? this.game.mouseHandler : this.fakeMouseHandler;
            scene.updateInternal(sceneDt, data.time, keyHandler, mouseHandler);
        }
    }

    public draw(ctx: CanvasRenderingContext2D, time: number, dt: number) {
        for (const scene of this.scenes) {
            const data = this.getData(scene);
            ctx.save();
            const opacity = scene.getOpacityInterpolation(clamp(data.opacity, 0, 1));
            scene.draw(ctx, opacity, data.time, data.dt);
            ctx.restore();
        }
    }

    public add(scene: Scene): this {
        scene.setManager(this);
        this.allScenes.push(scene);
        return this;
    }

    public isSceneActive(scene: Scene) {
        return scene === this.focusedScene;
    }

    public isSceneAlive(scene: Scene) {
        return this.scenes.includes(scene);
    }

    public getFocusedScene(): Scene {
        return this.focusedScene;
    }

    public openOnTop(scene: Scene | string, duration?: number): Promise<void> {
        scene = this.getScene(scene);
        this.focusedScene = scene;
        this.enable(scene, duration);
        return new Promise((resolve) => {
            const data = this.getData(scene as Scene);
            data.resolver = resolve;
        });
    }

    public switchTo(scene: Scene | string, duration?: number | null, fadeMode?: FadeMode): Promise<void> {
        scene = this.getScene(scene);
        this.focusedScene && this.disable(this.focusedScene, duration ?? DEFAULT_TRANSITION_DURATION, fadeMode);
        this.focusedScene = scene;
        this.enable(scene, duration, fadeMode);
        return new Promise((resolve) => {
            const data = this.getData(scene as Scene);
            data.resolver = resolve;
        });
    }

    public fadeOut(scene: Scene | string, duration?: number): Promise<void> {
        scene = this.getScene(scene);
        this.disable(scene, duration);
        return new Promise((resolve) => {
            const data = this.getData(scene as Scene);
            data.fadeOutResolver = resolve;
        });
    }

    public getScene(scene: string | Scene): Scene {
        if (scene instanceof Scene) {
            return scene;
        }
        const name = scene;
        scene = this.allScenes.find(s => s.name === scene);
        if (scene == null) {
            throw new Error("Scene '" + name + "' does not exist");
        }
        return scene;
    }

    public disable(scene: Scene, duration = DEFAULT_TRANSITION_DURATION, fadeMode = FadeMode.CROSS) {
        const data = this.getData(scene);
        if (data.fadeDirection >= 0) {
            scene.onFadeOut();
            data.resolver && data.resolver();
        }
        data.fadeDirection = -1;
        switch (fadeMode) {
            case FadeMode.CROSS:
                data.fadeDuration = duration;
                break;
            case FadeMode.IN:
                data.fadeDuration = duration;
                data.opacity = 2;
                break;
            case FadeMode.AFTER:
                data.fadeDuration = duration / 2;
                break;
        }
    }

    private enable(scene: Scene, duration = DEFAULT_TRANSITION_DURATION, fadeMode = FadeMode.CROSS) {
        const data = this.getData(scene);
        if (data.fadeDirection <= 0) {
            scene.onStart();
        }
        data.fadeDirection = 1;
        switch (fadeMode) {
            case FadeMode.CROSS:
                data.fadeDuration = duration;
                break;
            case FadeMode.IN:
                data.fadeDuration = duration / 2;
                break;
            case FadeMode.AFTER:
                data.fadeDuration = duration;
                data.opacity = -1;
                break;
        }
    }

    private disableNow(scene: Scene) {
        const data = this.getData(scene);
        data.fadeDirection = -1;
        data.opacity = 0;
        if (scene === this.focusedScene) {
            const remaining = this.scenes.filter(s => s !== scene);
            this.focusedScene = remaining[remaining.length - 1];
        }
    }

    private getData(scene: Scene) {
        scene = this.getScene(scene);
        if (scene instanceof Scene && !this.sceneData.has(scene)) {
            this.sceneData.set(scene, {
                fadeDirection: 0,
                fadeDuration: 1,
                opacity: 0,
                time: 0,
                dt: 0,
                resolver: null,
                fadeOutResolver: null
            });
        }
        return this.sceneData.get(scene);
    }
}
