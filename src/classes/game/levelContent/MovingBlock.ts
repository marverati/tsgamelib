import Vector2 from "../../shared/Vector2";
import Block from "./Block";

export enum Movements {
    NONE = "none",
    LINEAR = "linear",
    SIN = "sin",
}

enum States {
    pauseStart = 0,
    toTarget = 1,
    pauseTarget = 2,
    toStart = 3
}

export default class MovingBlock extends Block {
    protected positions: Vector2[] = [];
    protected movement: Movements;
    protected pauseLength;
    protected speed;
    protected active = true;
    protected timeRemainingInState = 0;
    protected timeInState = 1;
    protected isPausing = false;
    protected currentStartIndex = 0;
    protected currentTargetIndex = 1;

    public constructor(protected x: number, protected y: number, protected w: number, protected h: number, speed = 120, movement = Movements.LINEAR, pauseLength = 2) {
        super(x - w / 2, y - h / 2, w, h);
        this.positions = [ new Vector2(x, y) ];
        this.speed = speed;
        this.movement = movement;
        this.pauseLength = pauseLength;
    }

    public addTarget(x: number, y: number): this {
        this.positions.push(new Vector2(x, y));
        return this;
    }

    public setMovement(movement: Movements): this {
        this.movement = movement;
        return this;
    }

    public setSpeed(speed: number): this {
        this.speed = speed;
        return this;
    }

    public setPause(pause: number): this {
        this.pauseLength = Math.max(0, pause);
        return this;
    }

    public update(dt: number, t: number): void {
        if (dt > 0 && this.active && this.positions.length > 1) {
            this.timeRemainingInState -= dt;
            if (this.timeRemainingInState <= 0) {
                this.nextState();
            } else {
                // Platform is either pausing or moving
                if (!this.isPausing) {
                    // Platform is moving -> update position and velocity
                    if (this.movement === Movements.LINEAR) {
                        this.updateLinear();
                    } else if (this.movement === Movements.SIN) {
                        this.updateSin();
                    }
                }
            }
        }
    }

    protected updateLinear() {
        const p = 1 - this.timeRemainingInState / this.timeInState;
        const start = this.positions[this.currentStartIndex], target = this.positions[this.currentTargetIndex];
        const diff = target.sub(start);
        const pos = start.blend(target, p);
        this.setCenter(pos.x, pos.y);
        this.v = diff.scale(1 / this.timeInState);
    }

    protected updateSin() {
        const p = 1 - this.timeRemainingInState / this.timeInState;
        const start = this.positions[this.currentStartIndex], target = this.positions[this.currentTargetIndex];
        const diff = target.sub(start);
        const pos = start.blend(target, 0.5 - 0.5 * Math.cos(Math.PI * p));
        this.setCenter(pos.x, pos.y);
        this.v = diff.normalize(Math.sin(Math.PI * p) * this.speed * Math.PI / 2); // TODO find correct scaling factor
    }

    protected getNextIndex(index: number): number {
        return (index + 1) % this.positions.length;
    }

    protected getMovementDuration(indexFrom: number, indexTo: number): number {
        const diff = this.positions[indexTo].sub(this.positions[indexFrom]);
        const l = diff.getLength();
        return l / this.speed;
    }

    protected nextState(): void {
        if (this.isPausing) {
            // Start moving after pause
            this.isPausing = false;
            this.moveOn();
        } else {
            // Move finished, either pause or move on to next
            const pause = this.pauseLength;
            if (pause > 0) {
                this.isPausing = true;
                this.v = new Vector2(0, 0);
                this.timeRemainingInState = this.timeInState = pause;
                // Make sure to pause in precisely right position
                const pos = this.positions[this.currentTargetIndex];
                this.setCenter(pos.x, pos.y);
            } else {
                // move on immediately
                this.moveOn();
            }
        }
    }

    protected moveOn() {
        this.currentStartIndex = this.currentTargetIndex;
        this.currentTargetIndex = this.getNextIndex(this.currentTargetIndex);
        this.timeRemainingInState = this.timeInState = this.getMovementDuration(this.currentStartIndex, this.currentTargetIndex);
    }
}