import Game from "./classes/Game"
import Level from "./classes/game/Level";
import MovingBlock, { Movements } from "./classes/game/levelContent/MovingBlock";
import Player from "./classes/game/Player";
import VeryFirstScene from "./classes/game/scenes/VeryFirstScene";
import LoadScene from "./classes/game/scenes/LoadScene";
import GameScene from "./classes/game/scenes/GameScene";
import WinScene from "./classes/game/scenes/WinScene";
import LoseScene from "./classes/game/scenes/LoseScene";
import { exposeToWindow } from "./classes/shared/util";

export let game: Game;

window.addEventListener("load", () => {
    game = Game.getInstance();
    game.setCanvas("gameCanvas");
    // Scene setup
    let gameScene: GameScene;
    game.sceneManager
        .add(new VeryFirstScene())
        .add(new LoadScene())
        .add(gameScene = new GameScene())
        .add(new WinScene())
        .add(new LoseScene())
        .switchTo("VeryFirstScene", 1)
    game.loader.loadAll().then(() => {
        buildLevel(gameScene)
    });
    exposeToWindow({ game });
});


function buildLevel(gameScene: GameScene): Level {
    const level = new Level(gameScene, 500, 3000);

    const BLOCK_W = 100
    const BLOCK_H = 50

    for (let i = 0; i < 100; i+=3) {
        level.addBlock(i*100 % 500, 2800 - i*200, BLOCK_W, BLOCK_H);
        level.addBlock((i+1)*100 % 500, 2800 - (i+1)*200, BLOCK_W, BLOCK_H);

        level.addBlock(
            new MovingBlock(-BLOCK_W, 2800 - (i+2)*200, BLOCK_W, BLOCK_H)
                //.addTarget(-B, 2800 - (i+2)*200)
                .addTarget(500+BLOCK_W, 2800 - (i+2)*200)
                .setMovement(Movements.SIN)
                .setPause(1)
        );
    }

    const p1 = new Player(250, 3000);

    exposeToWindow({ "player1": p1 });
    level.addCharacters([p1]);
    gameScene.setLevel(level)

    return level;
}
