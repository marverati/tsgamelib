import Game from "./Game";

export type GameObjectState = Record<string, any> | null;

export default abstract class GameObject {

    public constructor() {
        this.getGame().register(this);
    }

    public abstract getState(): GameObjectState;

    public update(dt: number, time: number): void {};

    public draw(ctx: CanvasRenderingContext2D, time: number, dt: number): void {};

    protected getGame() {
        return Game.getInstance();
    }
}