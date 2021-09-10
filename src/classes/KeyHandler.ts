
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

    public update(time = +performance.now()): void {
        this.tick++;
    }

    public get(key: string, caseSensitive = false): boolean {
        this.ensureExistence(key);
        if (!this.keyStates[key].state && key.length === 1 && !caseSensitive) {
            return this.get(this.getOtherCase(key), true);
        }
        return this.keyStates[key].state;
    }

    public getDown(key: string, caseSensitive = false): boolean {
        this.ensureExistence(key);
        const result = this.keyStates[key].state && this.keyStates[key].tick >= this.tick - 1;
        if (!result && key.length === 1 && !caseSensitive) {
            return this.getDown(this.getOtherCase(key), true);
        }
        return result;
    }

    public getUp(key: string, caseSensitive = false): boolean {
        this.ensureExistence(key);
        const result = !this.keyStates[key].state && this.keyStates[key].tick >= this.tick - 1;
        if (!result && key.length === 1 && !caseSensitive) {
            return this.getUp(this.getOtherCase(key), true);
        }
        return result;
    }

    public getChange(key: string): boolean {
        this.ensureExistence(key);
        return this.keyStates[key].tick === this.tick;
    }

    public getNext(): boolean {
        return [" ", "Enter"].some(k => this.getDown(k));
    }

    protected registerEvents(target: HTMLElement): void {
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

    private getOtherCase(key: string): string {
        if (key.length === 1) {
            const upper = key.toUpperCase();
            if (key === upper) {
                return key.toLowerCase();
            } else {
                return upper;
            }
        }
        return "";
    }
}

/**
 * A specific KeyHandler that never recognizes any key events.
 */
export class FakeKeyHandler extends KeyHandler {
    protected registerEvents(target: HTMLElement): void {}
}
