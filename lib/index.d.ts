import { SessionDescriptionHandlerModifier, LogConnector, SessionDescriptionHandlerFactory } from 'sip.js';
import { WebPhoneUserAgent } from './userAgent';
import { default as MediaStreams, MediaStreamsImpl } from './mediaStreams';
import { WebPhoneSession } from './session';
import { WebPhoneSessionDescriptionHandlerFactoryOptions } from './sessionDescriptionHandler';
export interface TransportServer {
    uri: string;
    isError?: boolean;
}
export interface WebPhoneRegistrationData {
    /** Sip Info recieved after registering device with RingCentral */
    sipInfo?: Array<SipInfo> | SipInfo;
    /** Sip error codes */
    sipErrorCodes?: string[];
}
export interface SipInfo {
    /** Username to connect to transport */
    username: string;
    /** Password to connect to transport */
    password: string;
    /** Authorization Id to connect to transport */
    authorizationId: string;
    /** Domain of transport server */
    domain: string;
    /** URL for outbound transport proxy */
    outboundProxy: string;
    /** V6 IP address for outbound transport proxy */
    outboundProxyIPv6?: string;
    /** URL for outbound backup transport proxy */
    outboundProxyBackup: string;
    /** V6 IP address for outbound backup transport proxy */
    outboundProxyIPv6Backup?: string;
    /** Transport type */
    transport: 'UDP' | 'TCP' | 'TLS' | 'WS' | 'WSS';
    /** Certificate to connect to transport */
    certificate: string;
    /** The interval in seconds after which the app must try to switch back to primary proxy if it was previously switched to backup */
    switchBackInterval: number;
}
export interface WebPhoneOptions {
    /** App key of the RingCentral Developer app */
    appKey?: string;
    /** Name used in user agent string */
    appName?: string;
    /** Version used in user agent string */
    appVersion?: string;
    /**
     * @internal
     * Helper class to load incoming and outgoing audio. The library already comes with an implementation of this class
     *
     * Can be overridden but the custom class should have `loadAudio`, `setVolume`, `playIncoming` and `playOutgoing` methods
     */
    audioHelper?: any;
    /** If `true`, user agent calls the stop() method on unload (if running in browser window).
     *
     * [Reference](https://github.com/onsip/SIP.js/blob/master/docs/api/sip.js.useragentoptions.autostop.md)
     *
     * default value `true`
     */
    autoStop?: boolean;
    /** If `true` log messages should be written to the browser console.
     *
     * default value `true`
     */
    builtinEnabled?: boolean;
    /** A function which will be called every time a log is generated. [Reference](https://github.com/onsip/SIP.js/blob/master/docs/api/sip.js.logconnector.md) */
    connector?: LogConnector;
    /** If `true` media will be sent prior to call being answered
     *
     * Set to `true` by default for firefox browser
     *
     * default value `false`
     */
    earlyMedia?: boolean;
    /** If `true`, `stripG722` and `stripTcpCandidates` modifiers will be enabled in SessionDescriptionHandler
     *
     * default value `true`
     */
    enableDefaultModifiers?: boolean;
    /** If `true`, dscp is enabled for senders track in peer connection
     *
     * default value `false`
     */
    enableDscp?: boolean;
    /** If `true`, media report is logged using logger */
    enableMediaReportLogging?: boolean;
    /** is `true`, `addMidLines` modifiers will be enabled in SessionDescriptionHandler */
    enableMidLinesInSDP?: boolean;
    /** Use SDP format instead of standards conformant format
     *
     * https://chromestatus.com/feature/5723303167655936
     */
    enablePlanB?: boolean;
    /** If `true`, QOS data will be collected when session starts */
    enableQos?: boolean;
    /** If `true`, turn servers passed with configuration will be used when generating ice candidates */
    enableTurnServers?: boolean;
    /** Max time in milliseconds to be considered when generating ice candidates
     *
     * default value `2000` when `enableTurnServers` is `true`, otherwise `500`
     */
    iceCheckingTimeout?: number;
    /** Policy used when generating ice candidates
     *
     * default value `all`
     */
    iceTransportPolicy?: RTCIceTransportPolicy;
    /** UUID to provide with "+sip.instance" Contact parameter. */
    instanceId?: string;
    /** Time in seconds to debounce sending CLRF keepAlive sequences by
     *
     * default value `10`
     */
    keepAliveDebounce?: number;
    /** Time in seconds to wait in between CLRF keepAlive sequences are sent
     *
     * default value `0`
     */
    keepAliveInterval?: number;
    /** Indicates the verbosity level of the log messages.
     *
     * 0 = Error
     * 1 = Warn
     * 2 = Log
     * 3 = Debug
     *
     * default value `0`
     */
    logLevel?: 0 | 1 | 2 | 3;
    /** Max retry attempts used for retrying to connect to outbound proxy when transport is disconnected
     *
     * If value is passed, `maxReconnectionAttempts` and `maxReconnectionAttemptsNoBackup` will be ignored
     *
     * If value is not passed, retry attempts will be decided using `maxReconnectionAttempts` and `maxReconnectionAttemptsNoBackup` depending on what proxy the transport connects to
     */
    maxReconnectionAttempts?: number;
    /** Max retry attempts used for retrying to connect to outbound proxy when transport is disconnected
     *
     * default value `15`
     */
    maxReconnectionAttemptsNoBackup?: number;
    /** Max retry attempts used for retrying to connect to outbound backup proxy when transport is disconnected
     *
     * default value `10`
     */
    maxReconnectionAttemptsWithBackup?: number;
    /** local and remote reference to HTML media elements */
    media?: {
        local?: HTMLMediaElement;
        remote?: HTMLMediaElement;
    };
    /** Constraints used when creating peerConnection
     *
     * default value `{ audio: true, video: false }`
     */
    mediaConstraints?: any;
    /** Default modifiers used for SessionDescriptionHandler
     *
     * [Reference](https://github.com/onsip/SIP.js/blob/master/docs/api/sip.js.sessiondescriptionhandlermodifier.md)
     */
    modifiers?: SessionDescriptionHandlerModifier[];
    /** Callback function called when session is created */
    onSession?: (session: WebPhoneSession) => any;
    /** Recurring time interval in seconds after which QOS stats are collected
     *
     * default value `5000`
     */
    qosCollectInterval?: number;
    /** Timeout before which reconenction is attempted when transport disconnects
     *
     * If value is passed, `reconnectionTimeoutNoBackup` and `reconnectionTimeoutNoBackup` will be ignored
     *
     * If value is not passed, reconnection timeout will be decided using `reconnectionTimeoutNoBackup` and `reconnectionTimeoutNoBackup` depending on what proxy the transport connects to
     */
    reconnectionTimeout?: number;
    /** Timeout before which reconenction is attempted when transport disconnects when connected to outbound proxy
     *
     * default value `5`
     */
    reconnectionTimeoutNoBackup?: number;
    /** Timeout before which reconenction is attempted when transport disconnects when connected to outbound backup proxy
     *
     * default value `4`
     */
    reconnectionTimeoutWithBackup?: number;
    /** Value to provide with "reg-id" Contact parameter. when registering */
    regId?: number;
    /** Factory for SessionDescriptionHandler.
     *
     * The library already uses a default implementation
     */
    sessionDescriptionHandlerFactory?: SessionDescriptionHandlerFactory;
    /** Options for SessionDescriptionHandler
     *
     * If a value is passed, options like enableDscp, iceCheckingTimeout, turnServers, stunServers, iceTransportPolicynd enablePlanBre ignored
     *
     * [Reference](https://github.com/onsip/SIP.js/blob/master/docs/api/sip.js.sessiondescriptionhandleroptions.md)
     */
    sessionDescriptionHandlerFactoryOptions?: WebPhoneSessionDescriptionHandlerFactoryOptions;
    /** Sip error codes. This value is picked from registrationData
     *
     * default value `['408', '502', '503', '504']` if registrationData does not have `sipErrorCodes`
     * @internal
     */
    sipErrorCodes?: string[];
    /** Stun servers used when generating ice candidates
     *
     * default value `['stun.l.google.com:19302']`
     */
    stunServers?: string[];
    /** Time in seconds to try connecting back to outbound proxy when transport has connected to backup outbound proxy */
    switchBackInterval?: number;
    /**
     * @internal
     * Used to store transport server details
     */
    transportServers?: TransportServer[];
    /** Turn servers used when generating ice candidates */
    turnServers?: string[];
    /** Unique ID used to make calls to SIP server
     *
     * Is generated by the library if not passed
     */
    uuid?: string;
    /** Key that will be used to save uuid in localStorage
     *
     * default value is used by the library if not passed
     *
     * default value `rc-webPhone-uuid`
     */
    uuidKey?: string;
}
/**
 * WebPhone class to initiate WebRTC calls
 */
export default class WebPhone {
    /** WebPhone version */
    private static version;
    /** Utility function to generate uuid */
    static uuid: () => string;
    /** Utility function to generate delay */
    static delay: (ms: number) => Promise<any>;
    /** Utility function to extend object */
    static extend: (dst?: any, src?: any) => any;
    static MediaStreams: typeof MediaStreams;
    static MediaStreamsImpl: typeof MediaStreamsImpl;
    /** Sip Info recieved from the registeration endpoint */
    sipInfo: SipInfo;
    /** Key that will be used to save uuid in localStorage */
    uuidKey: string | undefined;
    /** Name used in user agent string */
    appName: string | undefined;
    /** Version used in user agent string */
    appVersion: string | undefined;
    /** WebPhoneUserAgent instance */
    userAgent: WebPhoneUserAgent;
    /**
     *
     * @param registrationData
     * @param options
     *
     * Creates a new instance of WebPhoneSession that can be used to make and recieve WebRTC calls
     */
    constructor(registrationData?: WebPhoneRegistrationData, options?: WebPhoneOptions);
}
