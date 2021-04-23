import Game from "./Game";
import Scene from "./Scene";

export type SceneObjectState = Record<string, any> | null;

export default abstract class SceneObject {
    private scene: Scene;

    public constructor(scene: Scene) {
        this.scene = scene;
        this.scene.register(this);
    }

    public abstract getState(): SceneObjectState;

    public update(dt: number, time: number): void {};

    public draw(ctx: CanvasRenderingContext2D, time: number, dt: number): void {};

    protected getScene() {
        return this.scene;
    }
    
    protected getGame() {
        return this.scene.getGame();
    }
}