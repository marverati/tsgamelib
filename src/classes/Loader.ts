import { clamp } from "./shared/util";

export default class Loader {
    // private images = [];
    private count = 0;
    private errors = 0;
    private total = 0;
    private progress = 0;
    private allAdded = false;
    private resolver: Function = null;
    private resolvePromise: Promise<void> = null;

    public constructor() {}

    public loadAll() {
        this.allAdded = true;
        if (this.total >= this.count) {
            this.progress = 1;
            return Promise.resolve();
        } else {
            if (!this.resolvePromise) {
                this.resolvePromise = new Promise((resolve) => {
                    this.resolver = resolve;
                });
            }
            return this.resolvePromise;
        }
    };

    public loadImage(src: string, frameCountX = 1, frameCountY = 1): HTMLImageElement {
        this.count++;
        const img = new Image();
        console.log("Loading image");
        img.onload = () => {
            console.log("loaded");
            this.total++;
            if (frameCountX > 1 || frameCountY > 1) {
                // img.frameWidth = img.width / frameCountX;
                // img.frameHeight = img.height / frameCountY;
            }
            console.log("updating");
            this.update();
            console.log("done");
        };
        img.onerror = () => {
            console.log("errored");
            this.errors++;
            this.total++;
            this.update();
        };
        img.src = src;
        if (frameCountX > 1 || frameCountY > 1) {
            // img.frameCount = frameCountX * frameCountY;
            // img.frameCountX = frameCountX;
            // img.frameCountY = frameCountY;
            // img.frameWidth = 1; // updated when loaded
            // img.frameHeight = 1;
        }
        return img;
    };

    public loadAudio(soundData: Record<string, string>) {
        var sound = new Audio(soundData.src);
        for (let key in soundData) {
            if (key != "src") {
                // TODO fix this
                // (sound[key as string] as string) = soundData[key];
            }
        }
        // sound.isPlaying = function () {
        //     return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2)
        // }
        // sound.stop = function () {
        //     this.pause();
        //     this.currentTime = 0;
        // }
        // sound.trigger = function () {
        //     if (!this.isPlaying()) {
        //         this.play();
        //     }
        // }
        // sound.setVolume = function (volume) {
        //     if (this.minVolume && volume < this.minVolume) {
        //         this.volume = this.minVolume;
        //     } else if (this.maxVolume && volume > this.maxVolume) {
        //         this.volume = this.maxVolume;
        //     } else if (volume < 0) {
        //         this.volume = 0;
        //     } else {
        //         this.volume = volume;
        //     }
        // }
        return sound;
    }

    public update() {
        if (this.allAdded) {
            this.progress = clamp(this.total / this.count, 0, 1);
            console.log(this.total, " / ", this.count, " -> ", this.progress);
            if (this.total >= this.count) {
                if (this.resolver) {
                    this.resolver();
                }
            }
        }
    };

    public getProgress(): number {
        return this.progress;
    }

    public getErrors(): number {
        return this.errors;
    }
}