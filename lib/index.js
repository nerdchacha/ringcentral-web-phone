"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var levels_1 = require("sip.js/lib/core/log/levels");
var sip_js_1 = require("sip.js");
var userAgent_1 = require("./userAgent");
var mediaStreams_1 = __importStar(require("./mediaStreams"));
var utils_1 = require("./utils");
var constants_1 = require("./constants");
var sessionDescriptionHandler_1 = require("./sessionDescriptionHandler");
var version = require('../package.json').version;
var defaultWebPhoneOptions = {
    autoStop: true,
    builtinEnabled: true,
    earlyMedia: false,
    enableDefaultModifiers: true,
    enableDscp: false,
    iceTransportPolicy: 'all',
    maxReconnectionAttemptsNoBackup: 15,
    maxReconnectionAttemptsWithBackup: 10,
    mediaConstraints: constants_1.defaultMediaConstraints,
    modifiers: [],
    //FIXME: This should be in seconds since every other config is in seconds
    qosCollectInterval: 5000,
    reconnectionTimeoutNoBackup: 5,
    reconnectionTimeoutWithBackup: 4,
    transportServers: [],
    turnServers: [],
    uuid: (0, utils_1.uuid)(),
    uuidKey: constants_1.uuidKey
};
/**
 * WebPhone class to initiate WebRTC calls
 */
var WebPhone = /** @class */ (function () {
    // TODO: include 'WebPhone' for all apps other than Chrome and Glip
    // TODO: parse wsservers from new api spec
    /**
     *
     * @param registrationData
     * @param options
     *
     * Creates a new instance of WebPhoneSession that can be used to make and recieve WebRTC calls
     */
    function WebPhone(registrationData, options) {
        if (registrationData === void 0) { registrationData = {}; }
        if (options === void 0) { options = {}; }
        options = Object.assign({}, defaultWebPhoneOptions, options);
        this.sipInfo = registrationData.sipInfo[0] || registrationData.sipInfo;
        this.uuidKey = options.uuidKey;
        this.appName = options.appName;
        this.appVersion = options.appVersion;
        var id = options.uuid;
        localStorage.setItem(this.uuidKey, id);
        var uaMatch = navigator.userAgent.match(/\((.*?)\)/);
        var appClientOs = (uaMatch && uaMatch.length && uaMatch[1]).replace(/[^a-zA-Z0-9.:_]+/g, '-') || '';
        var userAgentString = (this.appName ? this.appName + (this.appVersion ? '/' + this.appVersion : '') + ' ' : '') +
            (appClientOs ? appClientOs : '') +
            " RCWEBPHONE/".concat(WebPhone.version);
        var modifiers = options.modifiers;
        if (!options.enableDefaultModifiers) {
            modifiers.push(sip_js_1.Web.stripG722);
            modifiers.push(sip_js_1.Web.stripTcpCandidates);
        }
        if (options.enableMidLinesInSDP) {
            modifiers.push(sip_js_1.Web.addMidLines);
        }
        var sdpSemantics = options.enablePlanB ? 'plan-b' : 'unified-plan';
        var stunServers = options.stunServers || constants_1.defaultStunServers;
        var iceTransportPolicy = options.iceTransportPolicy;
        var iceServers = [];
        if (options.enableTurnServers) {
            iceServers = options.turnServers.map(function (url) { return ({ urls: url }); });
            options.iceCheckingTimeout = options.iceCheckingTimeout || 2000;
        }
        iceServers = __spreadArray(__spreadArray([], iceServers, true), stunServers.map(function (_url) {
            var url = !/^(stun:)/.test(_url) ? "stun:".concat(_url) : _url;
            return { urls: url };
        }), true);
        var sessionDescriptionHandlerFactoryOptions = options.sessionDescriptionHandlerFactoryOptions || {
            iceGatheringTimeout: options.iceCheckingTimeout || 500,
            enableDscp: options.enableDscp,
            peerConnectionConfiguration: {
                iceServers: iceServers,
                iceTransportPolicy: iceTransportPolicy,
                sdpSemantics: sdpSemantics
            }
        };
        sessionDescriptionHandlerFactoryOptions.enableDscp = !!options.enableDscp;
        options.modifiers = modifiers;
        var browserUa = navigator.userAgent.toLowerCase();
        if (browserUa.includes('firefox') && !browserUa.includes('chrome')) {
            // FIXME: alwaysAcquireMediaFirst has been removed from SIP.js. Is it the same as earlyMedia?
            options.earlyMedia = true;
        }
        var sessionDescriptionHandlerFactory = options.sessionDescriptionHandlerFactory || sessionDescriptionHandler_1.defaultSessionDescriptionFactory;
        var sipErrorCodes = registrationData.sipErrorCodes && registrationData.sipErrorCodes.length
            ? registrationData.sipErrorCodes
            : constants_1.defaultSipErrorCodes;
        var reconnectionTimeout = options.reconnectionTimeoutWithBackup;
        var maxReconnectionAttempts = options.maxReconnectionAttemptsWithBackup;
        if (this.sipInfo.outboundProxy && this.sipInfo.transport) {
            options.transportServers.push({
                uri: this.sipInfo.transport.toLowerCase() + '://' + this.sipInfo.outboundProxy
            });
            reconnectionTimeout = options.reconnectionTimeoutNoBackup;
            maxReconnectionAttempts = options.maxReconnectionAttemptsNoBackup;
        }
        if (this.sipInfo.outboundProxyBackup && this.sipInfo.transport) {
            options.transportServers.push({
                uri: this.sipInfo.transport.toLowerCase() + '://' + this.sipInfo.outboundProxyBackup
            });
        }
        options.reconnectionTimeout = options.reconnectionTimeout || reconnectionTimeout;
        options.maxReconnectionAttempts = options.maxReconnectionAttempts || maxReconnectionAttempts;
        var transportServer = options.transportServers.length ? options.transportServers[0].uri : '';
        var configuration = {
            uri: sip_js_1.UserAgent.makeURI("sip:".concat(this.sipInfo.username, "@").concat(this.sipInfo.domain)),
            transportOptions: {
                server: transportServer,
                traceSip: true,
                connectionTimeout: 5,
                keepAliveDebounce: options.keepAliveDebounce,
                keepAliveInterval: options.keepAliveInterval
            },
            // WebPhoneTransport will handle reconnection.
            reconnectionAttempts: 0,
            authorizationUsername: this.sipInfo.authorizationId,
            authorizationPassword: this.sipInfo.password,
            logLevel: levels_1.Levels[options.logLevel] || constants_1.defaultLogLevel,
            logBuiltinEnabled: options.builtinEnabled,
            logConnector: options.connector || null,
            autoStart: false,
            autoStop: options.autoStop,
            userAgentString: userAgentString,
            sessionDescriptionHandlerFactoryOptions: sessionDescriptionHandlerFactoryOptions,
            sessionDescriptionHandlerFactory: sessionDescriptionHandlerFactory,
            allowLegacyNotifications: true
        };
        options.sipErrorCodes = sipErrorCodes;
        options.switchBackInterval = this.sipInfo.switchBackInterval;
        this.userAgent = (0, userAgent_1.createWebPhoneUserAgent)(configuration, this.sipInfo, options, id);
    }
    /** WebPhone version */
    WebPhone.version = version;
    /** Utility function to generate uuid */
    WebPhone.uuid = utils_1.uuid;
    /** Utility function to generate delay */
    WebPhone.delay = utils_1.delay;
    /** Utility function to extend object */
    WebPhone.extend = utils_1.extend;
    WebPhone.MediaStreams = mediaStreams_1.default;
    WebPhone.MediaStreamsImpl = mediaStreams_1.MediaStreamsImpl;
    return WebPhone;
}());
exports.default = WebPhone;
//# sourceMappingURL=index.js.map