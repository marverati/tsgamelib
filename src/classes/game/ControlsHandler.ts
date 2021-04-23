import { game } from "../../index";
import Character from "./Character";
import Game from "../Game";
import Level from "./Level";
import Vector2 from "../shared/Vector2";

const ATTRACT_POWER = 1500;
const REPELL_POWER = 1000;
const MAX_REPELL_DISTANCE = 1000;

export default class Controls {
    private player1: Character | null = null;
    private player2: Character | null = null;
    private players: Character[];

    public constructor() {
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
        if (game.keyHandler.getDown("q")) {
            this.attract();
        }
        if (game.keyHandler.getDown("e")) {
            this.repell();
        }
    }

    public updateCamera(context: CanvasRenderingContext2D): void {
        context.setTransform(1, 0, 0, 1, 0, 0);
        const cam = this.getCameraPosition();
        context.translate(context.canvas.width / 2, context.canvas.height / 2);
        context.scale(cam.zoom, cam.zoom);
        context.translate(-cam.x, -cam.y);
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
        const keys = game.keyHandler;
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