import { EventEmitter } from 'events';
import { Invitation, InvitationAcceptOptions, Inviter, SessionInviteOptions, SessionReferOptions, URI, Session } from 'sip.js';
import { IncomingResponse, OutgoingInviteRequest, OutgoingReferRequest } from 'sip.js/lib/core';
import { Command } from './constants';
import { MediaStreams } from './mediaStreams';
import { WebPhoneUserAgent } from './userAgent';
/**
 * Object representing all the headers used by RingCentral backend
 */
export interface RCHeaders {
    body?: string;
    reqid?: string;
    sid?: string;
    request?: string;
    from?: string;
    to?: string;
    srvLvl?: string;
    srvLvlExt?: string;
    nm?: string;
    toNm?: string;
    callAttributes?: string;
    srcIVRSiteName?: string;
    queueName?: string;
    queueExtPin?: string;
    inDID?: string;
    inDIDLabel?: string;
    callerId?: string;
    callerIdName?: string;
    displayInfo?: string;
    displayInfoSub?: string;
}
export interface ReplyOptions {
    replyType: number;
    replyText: string;
    timeValue: string;
    timeUnits: string;
    callbackDirection: string;
}
export interface RTCPeerConnectionLegacy extends RTCPeerConnection {
    getRemoteStreams: () => MediaStream[];
    getLocalStreams: () => MediaStream[];
}
export declare class CommonSession {
    /** @ignore */
    __isRecording?: boolean;
    /** @ignore */
    __localHold?: boolean;
    /** @ignore */
    __patched?: boolean;
    /** @ignore */
    __userAgentCoreEventsSetup?: boolean;
    /** Flag to check if the call is on hold or not */
    held?: boolean;
    /** Options to represent dom elements where media stream should be loaded */
    media?: {
        local?: HTMLMediaElement;
        remote?: HTMLMediaElement;
    };
    /** Flag to indicate if media stats are being collected */
    mediaStatsStarted?: boolean;
    /** MediaStreams class instance which has the logic to collect media stream stats */
    mediaStreams?: MediaStreams;
    /** Flag to check if the call is muted or not */
    muted?: boolean;
    /** Counter to represent how many media stats report were missed becuase of no audio */
    noAudioReportCount?: number;
    /** JOSN representation of RC headers received for an incoming call */
    rcHeaders?: RCHeaders;
    /** Flag to represent if reinvite request was sent because there was no audio reported */
    reinviteForNoAudioSent?: boolean;
    /** Time when session was started */
    startTime?: Date | undefined;
    /** @ignore */
    __accept?: typeof Invitation.prototype.accept;
    /** @ignore */
    __dispose?: typeof Session.prototype.dispose;
    /** Method to attach event listener for session specific events */
    addListener?: typeof EventEmitter.prototype.addListener;
    /** Add track to media source */
    addTrack?: typeof addTrack;
    /** RingCentral barge implementation */
    barge?: typeof barge;
    /** RingCentral blind transfer implementation */
    blindTransfer?: typeof blindTransfer;
    /**
     * @internal
     * Helper function which represents if call control features can be used or not
     */
    canUseRCMCallControl?: typeof canUseRCMCallControl;
    /**
     * @internal
     * Create session message which would be sent to the RingCentral backend
     */
    createSessionMessage?: typeof createSessionMessage;
    /** Sends a DTMF over the call */
    dtmf?: typeof dtmf;
    /** Emit session specific events which will trigger all the event listeners attached */
    emit?: typeof EventEmitter.prototype.emit;
    /** RingCentral flip implementation */
    flip?: typeof flip;
    /** RingCentral flip implementation */
    forward?: typeof forward;
    /** Put the call on hold */
    hold?: typeof hold;
    /** Ignore incoming call */
    ignore?: typeof ignore;
    /** Mute the call */
    mute?: typeof mute;
    /** Remove event listener */
    off?: typeof EventEmitter.prototype.off;
    /** Add event listener. Same as addListener */
    on?: typeof EventEmitter.prototype.on;
    /** Add once event listener. Same as addListener */
    once?: typeof EventEmitter.prototype.once;
    /** Returns if the call is on hold locally or not */
    onLocalHold?: typeof onLocalHold;
    /** RingCentral park implementation */
    park?: typeof park;
    /** Send a session reinvite */
    reinvite?: typeof reinvite;
    /** Remove event listener */
    removeListener?: typeof EventEmitter.prototype.removeListener;
    /** Remove all event listeners */
    removeAllListeners?: typeof EventEmitter.prototype.removeAllListeners;
    /** RingCentral reply with message implementation */
    replyWithMessage?: typeof replyWithMessage;
    /**
     * @internal
     * Helper method that sends an INFO request to other user agent and then waits for an INFO request from the other user agent
     */
    sendInfoAndRecieveResponse?: typeof sendInfoAndRecieveResponse;
    /**
     * @internal
     * Helper function to send INFO request with `move` instruction to RingCentral backend
     */
    sendMoveResponse?: typeof sendMoveResponse;
    /** Send `receiveConfirm` command to backend */
    sendReceiveConfirm?: typeof sendReceiveConfirm;
    /** Helper function to send session message to backend using UserAgent */
    sendSessionMessage?: typeof sendSessionMessage;
    /** Start recording the call */
    startRecord?: typeof startRecord;
    /** Function to stop collecting media stats */
    stopMediaStats?: typeof stopMediaStats;
    /** Stop recording the call */
    stopRecord?: typeof stopRecord;
    /** Send incoming call to voicemail */
    toVoicemail?: typeof toVoicemail;
    /** Transfer current call */
    transfer?: typeof transfer;
    /** Put the call on unhold */
    unhold?: typeof unhold;
    /** Unmute the call */
    unmute?: typeof unmute;
    /** RingCentral warm transfer implementation */
    warmTransfer?: typeof warmTransfer;
    /** RingCentral whisper implementation */
    whisper?: typeof whisper;
}
export declare type WebPhoneSession = WebPhoneInvitation | WebPhoneInviter;
/** This is an extension of the Invitation class of SIP.js
 *
 * [Reference](https://github.com/onsip/SIP.js/blob/master/docs/api/sip.js.invitation.md)
 */
export interface WebPhoneInvitation extends Invitation, CommonSession {
    /**
     * Accept the invitation.
     *
     * @remarks
     * Accept the incoming INVITE request to start a Session.
     * Replies to the INVITE request with a 200 Ok response.
     * Resolves once the response sent, otherwise rejects.
     *
     * This method may reject for a variety of reasons including
     * the receipt of a CANCEL request before `accept` is able
     * to construct a response.
     * @param options - Options bucket.
     */
    accept: typeof Invitation.prototype.accept;
    /**
     * User Agent instance
     */
    userAgent: WebPhoneUserAgent;
}
/** This is an extension of the Inviter class of SIP.js
 *
 * [Reference](https://github.com/onsip/SIP.js/blob/master/docs/api/sip.js.inviter.md)
 */
export interface WebPhoneInviter extends Inviter, CommonSession {
    /**
     * User Agent instance
     */
    userAgent: WebPhoneUserAgent;
}
export declare function patchWebphoneSession(session: WebPhoneSession): WebPhoneSession;
export declare function patchIncomingWebphoneSession(session: WebPhoneSession): void;
declare function canUseRCMCallControl(this: WebPhoneSession): boolean;
declare function createSessionMessage(this: WebPhoneSession, options: RCHeaders): string;
declare function sendReceiveConfirm(this: WebPhoneSession): Promise<IncomingResponse>;
declare function sendSessionMessage(this: WebPhoneSession, options: any): Promise<IncomingResponse>;
declare function sendInfoAndRecieveResponse(this: WebPhoneSession, command: Command, options?: any): Promise<any>;
declare function startRecord(this: WebPhoneSession): Promise<any>;
declare function stopRecord(this: WebPhoneSession): Promise<any>;
declare function sendMoveResponse(this: WebPhoneSession, reqId: number, code: number, description: string, options?: {
    extraHeaders?: Array<string>;
}): void;
declare function ignore(this: WebPhoneSession): Promise<IncomingResponse>;
declare function toVoicemail(this: WebPhoneSession): Promise<IncomingResponse>;
declare function replyWithMessage(this: WebPhoneSession, replyOptions: ReplyOptions): Promise<IncomingResponse>;
declare function flip(this: WebPhoneSession, target: any): Promise<any>;
declare function whisper(this: WebPhoneSession): Promise<any>;
declare function barge(this: WebPhoneSession): Promise<any>;
declare function park(this: WebPhoneSession): Promise<any>;
declare function mute(this: WebPhoneSession, silent?: boolean): void;
declare function unmute(this: WebPhoneSession, silent?: boolean): void;
declare function addTrack(this: WebPhoneSession, remoteAudioEle?: any, localAudioEle?: any): void;
declare function stopMediaStats(this: WebPhoneSession): void;
declare function blindTransfer(this: WebPhoneSession, target: string | URI | WebPhoneSession, options?: SessionReferOptions): Promise<OutgoingReferRequest>;
declare function warmTransfer(this: WebPhoneSession, target: string | URI | WebPhoneSession, options?: SessionReferOptions): Promise<OutgoingReferRequest>;
declare function transfer(this: WebPhoneSession, target: string | URI | WebPhoneSession, options?: SessionReferOptions): Promise<OutgoingReferRequest>;
/**
 *
 * @param this WebPhoneSessionSessionInviteOptions
 * @param options
 * @returns Promise<OutgoingInviteRequest>
 *
 * Sends a reinvite. Also makes sure to regenrate a new SDP by passing offerToReceiveAudio: true, offerToReceiveVideo: false  and iceRestart: true
 * Once the SDP is ready, the local description is set and the SDP is sent to the remote peer along with an INVITE request
 */
declare function reinvite(this: WebPhoneSession, options?: SessionInviteOptions): Promise<OutgoingInviteRequest>;
declare function hold(this: WebPhoneSession): Promise<void>;
declare function unhold(this: WebPhoneSession): Promise<void>;
declare function dtmf(this: WebPhoneSession, dtmf: string, duration?: number, interToneGap?: number): void;
declare function forward(this: WebPhoneSession, target: WebPhoneSession, acceptOptions: InvitationAcceptOptions, transferOptions: SessionReferOptions): Promise<OutgoingReferRequest>;
export declare function onSessionDescriptionHandlerCreated(session: WebPhoneSession): void;
declare function onLocalHold(this: WebPhoneSession): boolean;
export {};
