// import { Aseprite } from "./Aseprite";
import { clamp } from "./shared/util";
import { BitmapFont } from "./BitmapFont";

export enum Fonts {
    STANDARD_FONT = "assets/fonts/pixcelsior.font.json",
    SMALL_FONT = "assets/fonts/smallFont.font.json",
    HEADLINE_FONT = "assets/fonts/headline.font.json"
}

class GenericJob {
    constructor(public readonly callback: Function, public readonly resolve: Function, public readonly reject: Function) {
    }

    public run() {
        try {
            const result = this.callback();
            this.resolve(result);
        } catch(e) {
            this.reject(e);
            return false;
        }
        return true;
    }
}

export default class Loader {
    // private images = [];
    private count = 0;
    private errors = 0;
    private total = 0;
    private progress = 0;
    private allAdded = false;
    private resolver: Function = null;
    private resolvePromise: Promise<void> = null;
    private genericJobs: GenericJob[];
    private nextGenericJobTimeout = 0;

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
            setTimeout(() => this.loadNextGenericJob(), 0);
            return this.resolvePromise;
        }
    };

    private loadNextGenericJob() {
        if (this.genericJobs.length < 1) {
            return;
        }
        const job = this.genericJobs.shift();
        const success = job.run();
        if (!success) {
            this.errors++;
        }
        this.total++;
        this.update();
        const now = Date.now();
        if (now > this.nextGenericJobTimeout) {
            // Every 20ms we want to make sure there's a timeout between our generic jobs, in order to
            // not block the main loop for too long and still be able to render our updated loading screen
            this.nextGenericJobTimeout = now + 20;
            setTimeout(() => this.loadNextGenericJob(), 0);
        } else {
            // Run next synchronously if previous generic jobs didn't take too much time
            this.loadNextGenericJob();
        }
    }

    // public async loadAseprite(src: string,): Promise<Aseprite | null> {
    //     this.count++;
    //     return Aseprite.load(src)
    //         .then(aseprite => {
    //             this.total++;
    //             this.update();
    //             return aseprite;
    //         }).catch(() => {
    //             this.errors++;
    //             this.total++;
    //             this.update();
    //             return null;
    //         });
    // };

    public async loadFont(src: Fonts): Promise<BitmapFont> {
        this.count++;
        return BitmapFont.load(src)
            .then(font => {
                this.total++;
                this.update();
                return font;
            }).catch(() => {
                this.errors++;
                this.total++;
                this.update();
                return null;
            });
    }

    /**
     * Loader function for any code that should be run during load time that isn't covered by the
     * rest of the API.
     * Running expensive code as such a loadAny callback instead of directly within your class has
     * the advantage that it will be reflected by the loading screen, instead of blocking it from
     * appearing.
     *
     * @param callback - The (potentially expensive) code you want to run during load time.
     * @returns Promise for when the job has been executed.
     */
    public loadAny<T>(callback: () => T): Promise<T> {
        this.count++;
        return new Promise((resolve, reject) => {
            this.genericJobs.push(new GenericJob(callback, resolve, reject));
        });
    }

    public loadImage(src: string, frameCountX = 1, frameCountY = 1): HTMLImageElement {
        this.count++;
        const img = new Image();
        img.onload = () => {
            this.total++;
            if (frameCountX > 1 || frameCountY > 1) {
                // frameWidth/frameHeight typings in global.d.ts
                img.frameWidth = img.width / frameCountX;
                img.frameHeight = img.height / frameCountY;
            }
            if (!img.name) {
                img.name = this.getName(src);
            }
            this.update();
        };
        img.onerror = () => {
            this.errors++;
            this.total++;
            this.update();
        };
        img.src = src;
        if (frameCountX > 1 || frameCountY > 1) {
            // frameCount typings in global.d.ts
            img.frameCount = frameCountX * frameCountY;
            img.frameCountX = frameCountX;
            img.frameCountY = frameCountY;
            img.frameWidth = img.frameWidth || 1; // updated when loaded
            img.frameHeight = img.frameHeight || 1;
        }
        return img;
    };

    private getName(src: string): string {
        const p = Math.max(src.lastIndexOf("/"), src.lastIndexOf("\\"));
        return src.substr(p + 1); 
    }

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