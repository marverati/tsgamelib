import Block from "./levelContent/Block";
import Character from "./Character";
import Rect from "../shared/Rect";
import Vector2 from "../shared/Vector2";
import Game, { loadMedia } from "../Game";
import SceneObject from "../SceneObject";
import Loader from "../Loader";
import Scene from "../Scene";

const BORDER_BLOCK_SIZE = 8192;

export type Collider = Character | Block;
export type PossibleCollider = Collider | null;

@loadMedia
export default class Level extends SceneObject {
    // State properties
    private blocks: Block[] = [];
    private characters: Character[] = [];
    private gravity: Vector2 = new Vector2(0, 981); // assuming 100px = 1m we get earth gravity constant G = 981

    // Static & non-state-essential
    private static someImage: HTMLImageElement;

    public constructor(scene: Scene, private w: number, private h: number) {
        super(scene);
        if (w < Infinity && h < Infinity) {
            const sz = BORDER_BLOCK_SIZE;
            this.addBlock(-sz, -sz, sz, h + 2 * sz);
            this.addBlock(-sz, -sz, w + 2 * sz, sz);
            this.addBlock(w, -sz, sz, h + 2 * sz);
            this.addBlock(-sz, h, w + 2 * sz, sz);
        }
        Level.someImage && console.log("Loaded with size", Level.someImage.naturalWidth, Level.someImage.naturalHeight);
    }

    public static async load(loader: Loader): Promise<void> {
        Level.someImage = loader.loadImage("https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg");
    }

    public getState() {
        return {
            // TODO, including state of blocks, characters etc. I guess
        }
    }

    public update(dt: number, time: number): void {
        // Blocks
        for (const b of this.blocks) {
            b.update(dt, time);
        }
        // Characters
        for (const c of this.characters) {
            c.update(dt, time);
        }
    }

    public draw(ctx: CanvasRenderingContext2D, time: number, dt: number): void {
        // Background
        ctx.fillStyle = "#ccc";
        ctx.fillRect(0, 0, this.w, this.h);

        // Blocks
        for (const b of this.blocks) {
            b.draw(ctx);
        }

        // Characters
        for (const c of this.characters) {
            c.draw(ctx, time, dt);
        }
    }

    public getGravity(): Vector2 {
        return this.gravity;
    }

    public getCollisions(rect: Rect, character?: Character): Collider[] {
        const result = [];
        for (const b of this.blocks) {
            if (rect.overlaps(b)) {
                result.push(b);
            }
        }
        for (const c of this.characters) {
            if (rect.overlaps(c.getRect()) && c !== character) {
                result.push(c);
            }
        }
        return result;
    }

    public addBlock(block: Block): Block;
    public addBlock(x1: number, y1: number, w: number, h: number): Block;
    public addBlock(arg1: Block | number, y1?: number, w?: number, h?: number): Block {
        if (arg1 instanceof Block) {
            this.blocks.push(arg1);
            return arg1;
        } else {
            const block = new Block(arg1, y1, w, h);
            return this.addBlock(block);
        }
    }

    public addCharacters(chars: Character[]): void {
        for (const c of chars) {
            this.addCharacter(c);
        }
    }

    public addCharacter(char: Character): void {
        if (!(this.characters as Array<any>).includes(char)) {
            this.characters.push(char);
            char.setLevel(this);
        }
    }

    public getBlocks(): Block[] {
        return this.blocks;
    }

    public getCharacters(): Character[] {
        return this.characters;
    }
}
