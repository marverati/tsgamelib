import { clamp } from "./shared/util";

/**Default fade time between music tracks, in seconds */
const DEFAULT_FADE_TIME = 3;

/**
 * A MusicManager is a class handling playing, looping, pausing and fading of music.
 * Usually, a game just needs one MusicManager. It will probably be bound to the Game class.
 * Loading is not part of the MusicManager's job. Game scenes etc. can load the music in
 * their load method, and provide the loaded HTMLAudioElement to the MusicManager when
 * asking to play/loop it.
 */
export default class MusicManager {
    private activeTracks: PlayingMusic[] = [];
    private mainTrack: PlayingMusic | null = null;
    private time = 0;

    constructor() {
    }

    public update(dt: number, time: number): void {
        this.time = time;
        // Fading and updating of individual running tracks
        for (let i = this.activeTracks.length - 1; i >= 0; i--) {
            const remove = this.activeTracks[i].update(dt, time);
            if (remove && this.activeTracks[i] !== this.mainTrack) {
                this.activeTracks.splice(i, 1);
            }
        }
        // If nothing is playing right now, play main track again
        if (this.activeTracks.every(track => !track.isPlaying())) {
            this.resume(DEFAULT_FADE_TIME);
        }
    }

    /**
     * Play the given music track once. If another music has been looped or played before, focus
     * will jump back to that track once this is over.
     *
     * @param {HTMLAudioElement} music - The music to play.
     * @param {number} fadeTime - Time in seconds to fade from last track to this one.
     */
    public playOnce(music: HTMLAudioElement | null, fadeTime = DEFAULT_FADE_TIME) {
        const track = music ? this.getOrCreate(music) : null;
        this.pauseAll(fadeTime, track);
        if (track) {
            track.music.loop = false;
            track.music.play();
            track.fadeIn(fadeTime);
        }
    }

    /**
     * Loop the given music. It will then also resume after other tracks are played once. But if a
     * different track is looped, that one will be the new main track.
     *
     * @param {HTMLAudioElement} music - The music to loop.
     * @param {number} fadeTime - Time in seconds to fade from last track to this one.
     */
    public loop(music: HTMLAudioElement, fadeTime = DEFAULT_FADE_TIME) {
        const track = this.getOrCreate(music);
        this.mainTrack = track;
        this.pauseAll(fadeTime, track);
        track.music.loop = true;
        track.music.play();
        track.fadeIn(fadeTime);
    }

    /**
     * Pause the music. It will be possible to resume it after.
     *
     * @param fadeTime - Time in seconds to fade out the current music. Defaults to 0.1 for semi-instant pausing.
     */
    public pause(fadeTime = 0.1) {
        this.playOnce(null, fadeTime);
    }

    /**
     * Resume whatever music had been played before.
     *
     * @param fadeTime - Time in seconds to fade in previously played music.
     */
    public resume(fadeTime = 0) {
        this.resumeLast(fadeTime);
    }

    private resumeLast(fadeTime: number) {
        if (this.mainTrack && this.activeTracks.includes(this.mainTrack)) {
            this.loop(this.mainTrack.music, fadeTime);
        } else {
            const tracks = this.activeTracks.filter(track => !track.hasEnded());
            if (tracks.length > 0) {
                const music = tracks[tracks.length - 1].music;
                if (music.loop) {
                    this.loop(music, fadeTime);
                } else {
                    this.playOnce(music, fadeTime);
                }
            }
        }
    }

    private pauseAll(fadeTime: number, except?: PlayingMusic, ) {
        for (const track of this.activeTracks) {
            if (track !== except) {
                track.fadeOut(fadeTime);
            }
        }

    }

    private getOrCreate(music: HTMLAudioElement): PlayingMusic {
        let result = this.get(music);
        if (!result) {
            result = new PlayingMusic(music);
            this.activeTracks.push(result);
        } else {
            // Ensure track is top most element of array
            const index = this.activeTracks.findIndex(track => track.music === music);
            if (index < this.activeTracks.length - 1) {
                this.activeTracks.splice(index, 1);
                this.activeTracks.push(result);
            }
        }
        return result;
    }

    private get(music: HTMLAudioElement): PlayingMusic | null {
        return this.activeTracks.find(track => track.music === music) || null;
    }

}

enum MusicState {
    OFF = "off",
    FADE_IN = "fadeIn",
    PLAYING = "playing",
    FADE_OUT = "fadeOut",
    ENDED = "ended"
}

/**
 * Wrapper around HTMLAudioElement, managing its state in more detail, including fading and general lifecycle.
 */
class PlayingMusic {
    public state  = MusicState.OFF;
    private opacity = 0;
    private fadeDuration = 0;

    constructor(public readonly music: HTMLAudioElement) {
    }

    public fadeIn(duration: number) {
        this.fadeDuration = duration;
        if (this.opacity < 1) {
            this.state = MusicState.FADE_IN;
        }
    }

    public fadeOut(duration: number) {
        this.fadeDuration = duration;
        if (this.opacity > 0) {
            this.state = MusicState.FADE_OUT;
        }
    }

    public isPlaying() {
        return this.state === MusicState.FADE_IN || this.state === MusicState.PLAYING;
    }

    public hasEnded() {
        return this.state === MusicState.ENDED;
    }

    public isLooping() {
        return this.music.loop;
    }

    private setOpacity(v: number): void {
        this.opacity = clamp(v, 0, 1);
        this.music.volume = this.opacity; // TODO: allow setting individual music max volume
    }

    public update(dt: number, time: number): boolean {
        switch (this.state) {
            case MusicState.FADE_IN:
                this.setOpacity(this.opacity + dt / this.fadeDuration);
                if (this.opacity >= 1) {
                    // Fade in done
                    this.state = MusicState.PLAYING;
                }
                break;
            case MusicState.PLAYING:
                if (this.music.paused && this.music.duration > 0) {
                    // Music ended
                    this.state = MusicState.ENDED;
                }
                break;
            case MusicState.FADE_OUT:
                this.setOpacity(this.opacity - dt / this.fadeDuration);
                if (this.opacity <= 0) {
                    // Fade out done
                    this.state = MusicState.OFF;
                    this.music.pause();
                }
                break;
        }
        return (this.state === MusicState.ENDED);
    }
}