import { EventEmitter } from 'events';
import { UserAgent, UserAgentOptions, Registerer, SessionDescriptionHandlerModifier } from 'sip.js';
import { IncomingResponse } from 'sip.js/lib/core';
import { WebPhoneTransport } from './transport';
import { SipInfo, WebPhoneOptions } from './index';
import { AudioHelper } from './audioHelper';
import { RCHeaders, WebPhoneSession } from './session';
/** RingCentral Active call info */
export interface ActiveCallInfo {
    id: string;
    from: string;
    to: string;
    direction: string;
    sipData: {
        toTag: string;
        fromTag: string;
    };
}
/**
 * WebPhoneUserAgent that makes SIP calls on behalf of the user
 */
export interface WebPhoneUserAgent extends UserAgent {
    /** Utility class to help play incoming and outgoing cues for calls */
    audioHelper?: AudioHelper;
    /** RTC constraints to be passed to browser when requesting for media stream */
    constraints?: object;
    /**
     * @internal
     * Contains list of default headers needed to be sent to RingCentral SIP server
     */
    defaultHeaders?: string[];
    /**
     * If `true`, the first answer to the local offer is immediately utilized for media.
     * Requires that the INVITE request MUST NOT fork.
     * Has no effect if `inviteWithoutSdp` is true.
     */
    earlyMedia?: boolean;
    /** If `true`, logs media stats when an connection is established */
    enableMediaReportLogging?: boolean;
    /** If `true`, Qality of service of the call is generated and published to RingCentral server once the call ends */
    enableQos?: boolean;
    /** instanceId used while registering to the backend SIP server */
    instanceId?: string;
    /** HTML media elements where local and remote audio and video streams should be sent */
    media?: {
        local?: HTMLMediaElement;
        remote?: HTMLMediaElement;
    };
    /** SDP modifieres to be used when generating local offer or creating answer */
    modifiers?: SessionDescriptionHandlerModifier[];
    /** Time interval in ms on how often should the quality of service data be collected */
    qosCollectInterval?: number;
    /** regId used while registering to the backend SIP server */
    regId?: number;
    /**
     * @internal
     * Instance of Registerer which will be used to register the device
     */
    registerer?: Registerer;
    /** sip info recieved by RingCentral backend server when provisioning a device */
    sipInfo?: SipInfo;
    /** Transport class over which communication would take place */
    transport: WebPhoneTransport;
    /** To add event listeneres to be triggered whenever an event on UserAgent is emitted */
    addListener?: typeof EventEmitter.prototype.addListener;
    /**
     * @internal
     * Helper function to create RingCentral message
     */
    createRcMessage?: (options: RCHeaders) => string;
    /** Emit event along with data which will trigger all listerenes attached to that event */
    emit?: typeof EventEmitter.prototype.emit;
    /** Send call invitation */
    invite?: (number: string, options: InviteOptions) => WebPhoneSession;
    /** Remove event listener from list of listeners for that event */
    off?: typeof EventEmitter.prototype.off;
    /** To add event listeneres to be triggered whenever an event on UserAgent is emitted */
    on?: typeof EventEmitter.prototype.on;
    /**
     * @internal
     * Function which will be called when session is created. It's value is picked using options.onSession when instantiating userAgent object
     */
    onSession?: (session: WebPhoneSession) => void;
    /** Register devide with the registrar */
    register?: () => Promise<void>;
    /** Remove event listener from list of listeners for that event */
    removeListener?: typeof EventEmitter.prototype.removeListener;
    /**
     * @internal
     * Utility function used to send message to backend server
     */
    sendMessage?: (to: string, messageData: string) => Promise<IncomingResponse>;
    /** To switch from another device to this device */
    switchFrom?: (activeCall: ActiveCallInfo, options: InviteOptions) => WebPhoneSession;
    /** Unregister device from the registrar */
    unregister?: () => Promise<void>;
}
export interface InviteOptions {
    fromNumber?: string;
    homeCountryId?: string;
    extraHeaders?: string[];
    RTCConstraints?: any;
}
/** @ignore */
export declare function createWebPhoneUserAgent(configuration: UserAgentOptions, sipInfo: SipInfo, options: WebPhoneOptions, id: string): WebPhoneUserAgent;
