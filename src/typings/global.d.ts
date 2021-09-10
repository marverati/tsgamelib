export {};


interface Keyboard {
    async lock(keyCodes?: Iterable<DOMString>): Promise<void>;
    unlock(): void;
}


declare global {
    interface Navigator {
        // See https://wicg.github.io/keyboard-lock/
        readonly keyboard: Keyboard
    }
    interface HTMLImageElement {
        frameCount: number | undefined;
        frameCountX: number | undefined;
        frameCountY: number | undefined;
        frameWidth: number | undefined;
        frameHeight: number | undefined;
    }
}
