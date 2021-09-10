import Character from "./Character";
import Vector2 from "../shared/Vector2";
import SceneObject from "./SceneObject";
import GameScene from "./scenes/GameScene";
import Scene from "../Scene";

const ATTRACT_POWER = 1500;
const REPELL_POWER = 1000;
const MAX_REPELL_DISTANCE = 1000;

export default class ControlsHandler extends SceneObject {
    private player1: Character | null = null;
    private player2: Character | null = null;
    private players: Character[];

    public constructor(scene: Scene) {
        super(scene);
    }

    public getState(): null {
        return null;
    }

    public setPlayers(player1: Character | null, player2: Character | null) {
        this.player1 = player1;
        this.player2 = player2;
        this.players = [ player1, player2 ].filter(p => p != null);
    }

    public update(dt: number, time: number): void {
        this.player1 && this.control(this.player1, "w", "a", "s", "d");
        this.player2 && this.control(this.player2, "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight");

        // Temporary solution for bonding controls
        if (this.scene.getKeyHandler().getDown("q")) {
            this.attract();
        }
        if (this.scene.getKeyHandler().getDown("e")) {
            this.repell();
        }

        this.updateCamera();
    }

    public draw(): void {}

    public updateCamera(): void {
        const canvas = this.getGame().getCanvas();
        if (!canvas) {
            return;
        }

        // TODO polyfill for IE users?
        const cam = this.getCameraPosition();
        let matrix = new DOMMatrix();
        matrix = matrix.translate(canvas.width / 2, canvas.height / 2);
        matrix = matrix.scale(cam.zoom, cam.zoom);
        matrix = matrix.translate(-cam.x, -cam.y);
        (this.scene as GameScene).setCamera(matrix);
        this.scene.getMouseHandler().setCanvasTransform(canvas.width / 2 - cam.zoom * cam.x, canvas.height / 2 - cam.zoom * cam.y, cam.zoom, cam.zoom, 0);
    }

    public getCameraPosition(): {x: number, y: number, zoom: number} {
        // TODO smoother movement & zooming
        const zoomBuffer = 220;
        let sum = new Vector2(), x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
        this.players.forEach(p => {
            sum = sum.add(p.getPos())
            x1 = Math.min(x1, p.getX());
            y1 = Math.min(y1, p.getY());
            x2 = Math.max(x2, p.getX());
            y2 = Math.max(y2, p.getY());
        });
        x1 -= zoomBuffer; y1 -= zoomBuffer; x2 += zoomBuffer; y2 += zoomBuffer;
        const zoomX = 960 / (x2 - x1), zoomY = 600 / (y2 - y1); // TODO use non-hardcoded canvas size
        const zoom = Math.min(1, zoomX, zoomY);
        const pos = sum.scale(1 / this.players.length);
        return {
            x: pos.x,
            y: pos.y,
            zoom
        };
    }

    private control(player: Character, up: string, left: string, down: string, right: string): void {
        const keys = this.scene.getKeyHandler();
        const rl = (keys.get(right) ? 1 : 0) - (keys.get(left) ? 1 : 0);
        const jump = keys.getDown(up);
        const hold = keys.get(down);
        if (hold) {
            player.hold();
        } else {
            player.unhold();
        }
        if (rl !== 0) {
            player.move(rl);
        }
        if (jump) {
            player.jump();
        }
    }

    private attract(): void {
        const diff = this.player2.getPos().sub(this.player1.getPos()).normalize(ATTRACT_POWER);
        this.player1.forceShoot(diff);
        this.player2.forceShoot(diff.invert());
    }

    private repell(): void {
        const diff = this.player1.getPos().sub(this.player2.getPos());
        const dis = diff.getLength();
        if (dis < MAX_REPELL_DISTANCE) {
            const power = 1 - dis / MAX_REPELL_DISTANCE;
            const v1 = diff.normalize(power * REPELL_POWER);
            const v2 = v1.invert();
            const ratio1 = this.player1.getEffectiveForceComponent(v1);
            const ratio2 = this.player1.getEffectiveForceComponent(v2);
            let factor1 = 1, factor2 = 1;
            if (ratio1 < ratio2) {
                // More force to player 2
                factor2 += (1 - ratio1) / 2;
            } else {
                // More force to player 1
                factor1 += (1 - ratio2) / 2;
            }
            this.player1.forceShoot(v1.scale(factor1));
            this.player2.forceShoot(v2.scale(factor2));
        }
    }
}