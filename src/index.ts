import Game from "./classes/Game"
import Level from "./classes/game/Level";
import MovingBlock, { Movements } from "./classes/game/levelContent/MovingBlock";
import Player from "./classes/game/Player";
import VeryFirstScene from "./classes/game/scenes/VeryFirstScene";
import LoadScene from "./classes/game/scenes/LoadScene";
import GameScene from "./classes/game/scenes/GameScene";
import { exposeToWindow } from "./classes/shared/util";
import PauseScene from "./classes/game/scenes/PauseScene";

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
        .add(new PauseScene())
        .switchTo("VeryFirstScene", 1)
    game.loader.loadAll().then(() => {
        buildLevel(gameScene)
    });
    exposeToWindow({ game });
});


function buildLevel(gameScene: GameScene): Level {
    const level = new Level(gameScene, 2000, 1500);
    level.addBlock(400, 1400, 200, 200);
    level.addBlock(500, 1310, 500, 200);
    level.addBlock(1200, 1310, 200, 200);
    level.addBlock(800, 510, 1000, 200);
    (window as any).elevator = level.addBlock(new MovingBlock(200, 1300, 260, 20, 500).addTarget(200, 1000).setMovement(Movements.SIN));
    level.addBlock(new MovingBlock(600, 1290, 260, 20, 250).addTarget(1200, 1290).addTarget(1200, 800).addTarget(1200, 1190).setMovement(Movements.SIN).setPause(1));
    const p1 = new Player(100, 1400), p2 = new Player(200, 1400);
    exposeToWindow({ "player1": p1, "player2": p2 });
    level.addCharacters([p1, p2]);
    gameScene.setLevel(level)
    return level;
}
