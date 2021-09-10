import { Howl } from "howler";
import { clamp } from "./shared/util";

export enum Sounds {
    SOUND_NAME = "assets/sound/some_sound.ogg",
}

export class SoundManager {
    private static instance: SoundManager = new SoundManager();
    private loops: Map<string, Howl[]> = new Map();
    private sounds: Set<Howl> = new Set();

    private constructor() {}

    public static getInstance(): SoundManager {
        return SoundManager.instance;
    }

    private isPlaying(src?: Sounds): boolean {
        return Array.from(this.loops.entries()).some(e => e[0] === src && e[1].length > 0);
    }

    public play(src?: Sounds, volume = 0.5, delay = 0, singleton = false): void {
        if (singleton && this.loops.get(src)?.length > 0) {
            return;
        }
        if (src != null && !this.isPlaying()) {
            const newSound = new Howl({
                src,
                loop: true,
                volume
            });
            if (delay) {
                setTimeout(() => {
                    newSound.play();
                }, delay);
            } else {
                newSound.play();
            }
            this.loops.set(src, [...(this.loops.get(src) ?? []), newSound]);
        }
    }

    public stop(src: Sounds, fadeout = 0) {
        const existingSounds = this.loops.get(src);
        const sound = existingSounds.pop();
        // Fadeout is not nice but howl is shit
        if (sound && fadeout > 0) {
            const volumeSteps = sound.volume() / fadeout * 100;
            const interval = setInterval(() => {
                const newVolume = clamp(sound.volume() - volumeSteps, 0, 1);
                sound.volume(newVolume);
                if (newVolume === 0) {
                    clearInterval(interval);
                    sound.unload();
                }
            }, 100);
        } else {
            sound?.unload();
        }
    }

    public playOnce(src: Sounds, volume = 0.2): void {
        if (!this.isPlaying()) {
            const sound = new Howl({
                src,
                autoplay: true,
                loop: false,
                volume,
                onend: () => {
                    this.sounds.delete(sound);
                },
            });
            this.sounds.add(sound);
        }
    }
    public mute(): void {
        this.sounds.forEach(s => s.mute(true));
        this.loops.forEach(ls => ls.forEach(l => l.mute(true)));
    }

    public unmute(): void {
        this.sounds.forEach(s => s.mute(false));
        this.loops.forEach(ls => ls.forEach(l => l.mute(false)));
    }
    public stopAll() {
        this.sounds.forEach(s => s.unload());
        this.loops.forEach(ls => ls.forEach(l => l.unload()));
    }
}
