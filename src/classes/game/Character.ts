import Level, { Collider, PossibleCollider } from "./Level";
import Block from "./levelContent/Block";
import Rect from "../shared/Rect";
import Vector2 from "../shared/Vector2";

const MAX_VELOCITY = 1000;

// Player can still jump after up to that many ms after losing ground contact (e.g. when running off ledge)
const JUMP_TOLERANCE_SECONDS = 0.12;

// When colliding with something, velocity will not be set to 0 but to this factor times gravity, in order to properly stick to the ground
const STANDING_GRAVITY_FACTOR = 0.05;

// If character gets stuck, e.g. by upward moving elevator, they'll be gravitated up by this much maximum (per frame) to resolve collision
const MAX_UNSTUCK_DISTANCE = 100;

type CollisionResult = {
    pos: Vector2,
    collided: PossibleCollider,
    collisionX: PossibleCollider,
    collisionY: PossibleCollider
};

export default class Character {
    protected pos: Vector2;
    protected v: Vector2;
    protected groundVelocity = new Vector2(0, 0);
    protected size: Vector2;
    protected speed: number;
    protected jumpPower: number;
    protected standing: PossibleCollider = null;
    protected holding = false;
    protected color: string;
    protected level: Level;
    protected rect: Rect = new Rect(0, 0, 1, 1);
    private rectInvalid = true;
    private targetDirection = 0;
    protected groundAcceleration = 2200;
    protected airAcceleration = 1000;
    protected lastTimeStanding = -Infinity;
    protected time = 0;
    protected hasAirControl = true;
    protected sprintFactor = 3;

    public constructor(x: number, y: number, w: number, h: number, speed: number, jumpPower: number, color: string = "black") {
        this.pos = new Vector2(x, y);
        this.v = new Vector2();
        this.size = new Vector2(w, h);
        this.speed = speed;
        this.jumpPower = jumpPower;
        this.color = color
    }

    public setLevel(level: Level) {
        this.level = level;
    }

    public update(dt: number, time: number): void {
        this.time = time;

        // Horizontal acceleration
        
        let playerBaseSpeed =  this.targetDirection * this.speed;
        if (this.level.scene.getKeyHandler().get("Shift")) {  // TODO move to ControlsHandler
            playerBaseSpeed *= 2;
        }
        const targetSpeed = playerBaseSpeed + this.groundVelocity.x;

        if (this.v.x !== targetSpeed && (this.standing || this.hasAirControl)) {
            const directionFactor = targetSpeed > this.v.x ? 1 : -1;
            const acc = this.standing ? this.groundAcceleration : this.airAcceleration;
            let vx = this.v.x + dt * acc * directionFactor;
            if ((directionFactor > 0) === (vx > targetSpeed)) {
                vx = targetSpeed;
            }
            this.v = this.v.setX(vx);
        }
        this.targetDirection = 0;

        // Gravity
        let v = this.v, halfGravityVelocity = v;
        if (dt !== 0) {
            v = this.v.add(this.level.getGravity().scale(dt));
            if (v.isLongerThan(MAX_VELOCITY)) {
                v = v.normalize(MAX_VELOCITY);
            }
            // For position update, apply only half gravity update (full update will be done after position update)
            // this ensures jump height is the same independent of frame rate (without this adjustment, low FPS
            // would cause lower jumps and people with bad PCs may get softlocked)
            halfGravityVelocity = this.v.blend(v, 0.5);
        }

        // Position update via sliding collision
        this.standing = null;
        let collided = false;
        if (dt !== 0 && !this.v.isNull()) {
            const collision = this.getSlidingCollision(halfGravityVelocity, dt, true);
            collided = collision.collided != null;
        }
        if (!collided) {
            this.v = v;
        }
    }

    public getRect(): Rect {
        if (this.rectInvalid) {
            this.rectInvalid = false;
            this.rect = Rect.fromCentered(this.pos.x, this.pos.y, this.size.x, this.size.y);
        }
        return this.rect;
    }

    protected collides(x = this.pos.x, y = this.pos.y, filterCollider?: ((c: Collider) => boolean)): PossibleCollider {
        const rect = this.getRect();
        let colliders = this.level.getCollisions(rect.clone().setCenter(x, y), this);
        if (filterCollider) {
            colliders = colliders.filter(filterCollider);
        }
        return colliders.length > 0 ? colliders[0] : null;
    }

    public draw(ctx: CanvasRenderingContext2D, time: number, dt: number): void {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.pos.x - this.size.x / 2 + 0.5, this.pos.y - this.size.y / 2 + 0.5, this.size.x - 1, this.size.y - 1);
    }

    public getPos(): Vector2 {
        return this.pos;
    }

    public getX(): number { return this.pos.x; }
    public getY(): number { return this.pos.y; }

    public getVelocity(): Vector2 {
        return this.v;
    }

    public move(dir = 0): void {
        this.targetDirection = dir;
    }

    public jump(power = 1): boolean {
        if (this.lastTimeStanding >= this.time - JUMP_TOLERANCE_SECONDS && !this.holding) {
            this._jump(power * this.jumpPower);
            return true;
        }
        return false;
    }

    protected _jump(power = this.jumpPower): void {
        this.v = this.v.setY(this.groundVelocity.y - power);
    }

    /**
     * Shoot character in the direction of given velocity.
     * @param v - Shoot velocity.
     */
    public forceShoot(v: Vector2): void {
        this.v = v;
        this.hasAirControl = false;
    }

    /**
     * Returns the fraction of the force that would not be absorbed by walls around the character, were the
     * character to be force shot with the given velocity. E.g. if vector points down while character is
     * standing on something, the value will be (very close to) 0. If the vector shows up while standing
     * freely, the factor will be 1 as the shot will be unobstructed. If the vector is 45° downwards while
     * standing on level ground, the factor will be ~0.71.
     * @param v - Shot velocity.
     * @return Ratio of how much of the velocity will survive based on surrounding collisions.
     */
    public getEffectiveForceComponent(v: Vector2): number {
        const factor = 0.1; // arbitrarily choosing 0.1s for the vector length
        const originalLength = v.getLength() * factor;
        const actual = this.getSlidingCollision(v, factor, false).pos;
        const actualDiff = actual.sub(this.pos);
        const effectiveLength = actualDiff.getLength();
        return effectiveLength / originalLength;
    }

    public hold() {
        this.holding = true;
    }

    public unhold() {
        this.holding = false;
    }

    protected moveToCollision(freePos: Vector2, colPos: Vector2, steps = 8) {
        for (let i = 0; i < steps; i++) {
            const mid = freePos.blend(colPos, 0.5);
            if (this.collides(mid.x, mid.y, c => c instanceof Block || c instanceof Character && !c.isAbove(this))) {
                colPos = mid;
            } else {
                freePos = mid;
            }
        }
        return freePos;
    }

    protected getSlidingCollision(v: Vector2, dt = 1, applySideEffects = false): CollisionResult {
        let xcol = null, ycol = null;
        let newx = this.pos.x + dt * v.x;
        if (xcol = this.collides(newx, this.pos.y)) {
            const closePos = this.moveToCollision(this.pos, new Vector2(newx, this.pos.y));
            newx = closePos.x;
            if (applySideEffects) {
                this.hasAirControl = true;
                // TODO handle gravity/standing in case it's non-vertical
            }
            v = v.setX(this.level.getGravity().x * STANDING_GRAVITY_FACTOR);
        }
        let newy = this.pos.y + dt * v.y;
        if (ycol = this.collides(newx, newy)) {
            const closePos = this.moveToCollision(new Vector2(newx, this.pos.y), new Vector2(newx, newy));
            newy = closePos.y;
            v = v.setY(this.level.getGravity().y * STANDING_GRAVITY_FACTOR);
            if (applySideEffects) {
                this.hasAirControl = true;
                if (v.isSameDirection(this.level.getGravity())) {
                    this.standing = ycol;
                    this.lastTimeStanding = this.time;
                    this.groundVelocity = ycol.getVelocity();
                    v = v.add(new Vector2(0, this.groundVelocity.y));
                }
            }
        }
        // Check for collision of new position: If still stuck, e.g. due  to elevator moving up, try to unstuck
        if (this.collides(newx, newy, c => c instanceof Block || c instanceof Character && !c.isAbove(this))) {
            const diff = this.level.getGravity().normalize(MAX_UNSTUCK_DISTANCE);
            const closePos = this.moveToCollision(new Vector2(newx, newy).sub(diff), new Vector2(newx, newy));
            newy = closePos.y;
        }
        const result = new Vector2(newx, newy);
        if (applySideEffects) {
            this.pos = result;
            this.rectInvalid = true;
            this.v = v;
        }
        return { pos: result, collided: xcol || ycol, collisionX: xcol, collisionY: ycol };
    }

    public isAbove(other: Character): boolean {
        const diff = other.pos.sub(this.pos);
        return diff.isSameDirection(this.level.getGravity());
    }
}
