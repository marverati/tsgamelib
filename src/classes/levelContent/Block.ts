import Rect from "../Rect";
import Vector2 from "../Vector2";

const BLOCK_COLOR = "#161616";

export default class Block extends Rect {

    protected v = new Vector2(0, 0);

    public draw(context: CanvasRenderingContext2D) {
        context.fillStyle = BLOCK_COLOR;
        context.fillRect(this.x1, this.y1, this.w, this.h);
    }

    public update(dt: number, t: number): void {}

    public getVelocity(): Vector2 {
        return this.v;
    }
}