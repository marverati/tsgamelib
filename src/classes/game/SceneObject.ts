import Scene from "../Scene";

export default class SceneObject {
    public constructor(public readonly scene: Scene) {
    }

    public getGame() {
        return this.scene.getGame();
    }
}