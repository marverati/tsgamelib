
type KeyState = {
    state: boolean;
    tick: number;
}

export default class KeyHandler {
    private keyStates: Record<string, KeyState> = {};
    private tick = 0;

    public constructor(target = document.body) {
        this.registerEvents(target);
    }

    public update(time = +Date.now()): void {
        this.tick++;
    }

    public get(key: string): boolean {
        this.ensureExistence(key);
        return this.keyStates[key].state;
    }

    public getDown(key: string): boolean {
        this.ensureExistence(key);
        return this.keyStates[key].state && this.keyStates[key].tick >= this.tick - 1;
    }

    public getUp(key: string): boolean {
        this.ensureExistence(key);
        return !this.keyStates[key].state && this.keyStates[key].tick >= this.tick - 1;
    }

    public getChange(key: string): boolean {
        this.ensureExistence(key);
        return this.keyStates[key].tick === this.tick;
    }

    private registerEvents(target: HTMLElement): void {
        target.addEventListener("keydown", this.handleKeyDown.bind(this));
        target.addEventListener("keyup", this.handleKeyUp.bind(this));
    }

    private handleKeyDown(e: KeyboardEvent): void {
        this.ensureExistence(e.key);
        const obj = this.keyStates[e.key];
        obj.state = true;
        obj.tick = this.tick;
    }

    private handleKeyUp(e: KeyboardEvent): void {
        this.ensureExistence(e.key);
        const obj = this.keyStates[e.key];
        obj.state = false;
        obj.tick = this.tick;
    }

    private ensureExistence(key: string): boolean {
        if (this.keyStates[key] != null) {
            return false;
        } else {
            this.keyStates[key] = {
                state: false,
                tick: 0
            };
            return true;
        }
    }
}