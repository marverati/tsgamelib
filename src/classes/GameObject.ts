import Game from "./Game";


export default abstract class GameObject {

    public constructor() {
        this.getGame().register(this);
    }

    public abstract update(dt: number, time: number): void;

    public abstract draw(ctx: CanvasRenderingContext2D, time: number, dt: number): void;

    protected getGame() {
        return Game.getInstance();
    }
}