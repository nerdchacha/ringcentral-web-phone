export interface DomAudio extends HTMLAudioElement {
    /** @ignore */
    playPromise?: Promise<any>;
}
export interface AudioHelperOptions {
    /** Enable audio feedback for incoming and outgoing calls */
    enabled?: boolean;
    /** Path to audio file for incoming call */
    incoming?: string;
    /** Path to audio file for outgoing call */
    outgoing?: string;
}
export declare class AudioHelper {
    private readonly _enabled;
    private _incoming;
    private _outgoing;
    private _audio;
    /** Current volume */
    volume: number;
    constructor(options?: AudioHelperOptions);
    private _playSound;
    /** Load incoming and outgoing audio files for feedback */
    loadAudio(options: AudioHelperOptions): void;
    /** Set volume for icoming and outgoing feedback */
    setVolume(volume: any): void;
    /**
     * Play or pause incoming feedback
     * @param value `true` to play audio and `false` to pause
     * @returns
     */
    playIncoming(value: any): AudioHelper;
    /**
     * Play or pause outgoing feedback
     * @param value `true` to play audio and `false` to pause
     * @returns
     */
    playOutgoing(value: any): AudioHelper;
}
