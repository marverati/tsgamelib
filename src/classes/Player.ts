import Character from "./Character";

const WIDTH = 40;
const HEIGHT = 36;
const SPEED = 220;
const JUMP_POWER = 460;

export default class Player extends Character {

    public constructor(x: number, y: number) {
        super(x, y, WIDTH, HEIGHT, SPEED, JUMP_POWER);
    }
}