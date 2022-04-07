import { WebPhoneSession } from './session';
import { RTPReport } from './rtpReport';
export declare enum Browsers {
    MSIE = "IE",
    Chrome = "Chrome",
    Firefox = "Firefox",
    Safari = "Safari",
    Opera = "Opera"
}
export declare class WebPhoneRTPReport implements RTPReport {
    outboundRtpReport: {};
    inboundRtpReport: {};
    rttMs: {};
    localCandidates: any[];
    remoteCandidates: any[];
    transport: {};
}
/** Media Streams class to monitor media stats */
export default class MediaStreams {
    /**
     * Reference to MediaStreamsImpl object. This Object has all the functions to handle media streams
     *
     * MediaStreams class is a wrapper around MediaStreamsImpl
     */
    mediaStreamsImpl: MediaStreamsImpl;
    /** Remove iceconnectionstatechange event listeners and stop collecting stats */
    release: any;
    /**
     * Reconnect media and send reinvite on the existing session.
     *
     * This will also recreate SDP and send it over with the reinvite message
     */
    reconnectMedia: any;
    /**
     * @param callback function which will be called every time media stats are generated. Will override callback passed to `onRTPStat`
     * @param interval interval for the recurring call to the callback function
     * @returns
     */
    getMediaStats: (callback: (report: RTPReport) => any, interval: number) => void;
    /** Stop collecting stats */
    stopMediaStats: () => void;
    constructor(session: WebPhoneSession);
    /**
     * Set a function to be called when media stats are generated
     * @param callback optionally, you can set a function on MediaStreams object. This will be treated as a default callback when media stats are generated if a callback function is not passed with `getMediaStats` function
     */
    set onRTPStat(callback: (stats: RTPReport, session: WebPhoneSession) => any);
    /**
     * Set a function to be called when `peerConnetion` iceconnectionstatechange changes
     * @param callback function to be called when `peerConnetion` iceconnectionstatechange changes
     */
    set onMediaConnectionStateChange(callback: (state: string, session: WebPhoneSession) => any);
}
/**
 * MediaStreams Implementation
 */
export declare class MediaStreamsImpl {
    private ktag;
    private session;
    private isChrome;
    private isFirefox;
    private isSafari;
    private mediaStatsTimer;
    preRTT: any;
    /**
     * Set a function to be called when `peerConnetion` iceconnectionstatechange changes
     *
     * @param callback function to be called when `peerConnetion` iceconnectionstatechange changes
     */
    onMediaConnectionStateChange: (state: string, session: WebPhoneSession) => any;
    /**
     * Set a function to be called when media stats are generated
     * @param callback optionally, you can set a function on MediaStreams object. This will be treated as a default callback when media stats are generated if a callback function is not passed with `getMediaStats` function
     */
    onRTPStat: (stats: RTPReport, session: WebPhoneSession) => any;
    private get tag();
    /**
     * Function to find what browser is being used depending on the `navigator.userAgent` value
     * @returns Browsers enum value to denote what browser if being used
     */
    browser(): Browsers | "unknown";
    private mediaStatsTimerCallback;
    private onPeerConnectionStateChange;
    private getRTPReport;
    constructor(session: any);
    /**
     * @param callback function which will be called every time media stats are generated. Will override callback passed to `onRTPStat`
     * @param interval interval for the recurring call to the callback function
     * @returns
     */
    getMediaStats(callback?: any, interval?: number): void;
    /**
     * Stop collecting stats. This will stop calling the registered function (either that was registered using `onRTPstat` or using `getMediaStats`)
     */
    stopMediaStats(): void;
    /**
     * Reconnect media and send reinvite on the existing session.
     *
     * This will also recreate SDP and send it over with the reinvite message
     */
    reconnectMedia(): Promise<void>;
    /**
     * Remove iceconnectionstatechange event listeners and stop collecting stats
     */
    release(): void;
}
export { MediaStreams };
