"use strict";
/*
 * @Author: Elias Sun(elias.sun@ringcentral.com)
 * @Date: Dec. 15, 2018
 * Copyright © RingCentral. All rights reserved.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaStreams = exports.MediaStreamsImpl = exports.WebPhoneRTPReport = exports.Browsers = void 0;
var events_1 = require("./events");
var ConnectionState;
(function (ConnectionState) {
    ConnectionState["new"] = "mediaConnectionStateNew";
    ConnectionState["checking"] = "mediaConnectionStateChecking";
    ConnectionState["connected"] = "mediaConnectionStateConnected";
    ConnectionState["completed"] = "mediaConnectionStateCompleted";
    ConnectionState["failed"] = "mediaConnectionStateFailed";
    ConnectionState["disconnected"] = "mediaConnectionStateDisconnected";
    ConnectionState["closed"] = "mediaConnectionStateClosed";
})(ConnectionState || (ConnectionState = {}));
var Browsers;
(function (Browsers) {
    Browsers["MSIE"] = "IE";
    Browsers["Chrome"] = "Chrome";
    Browsers["Firefox"] = "Firefox";
    Browsers["Safari"] = "Safari";
    Browsers["Opera"] = "Opera";
})(Browsers = exports.Browsers || (exports.Browsers = {}));
var WebPhoneRTPReport = /** @class */ (function () {
    function WebPhoneRTPReport() {
        this.outboundRtpReport = {};
        this.inboundRtpReport = {};
        this.rttMs = {};
        this.localCandidates = [];
        this.remoteCandidates = [];
        this.transport = {};
    }
    return WebPhoneRTPReport;
}());
exports.WebPhoneRTPReport = WebPhoneRTPReport;
/** Media Streams class to monitor media stats */
var MediaStreams = /** @class */ (function () {
    function MediaStreams(session) {
        this.mediaStreamsImpl = new MediaStreamsImpl(session);
        this.release = this.mediaStreamsImpl.release.bind(this.mediaStreamsImpl);
        this.reconnectMedia = this.mediaStreamsImpl.reconnectMedia.bind(this.mediaStreamsImpl);
        this.getMediaStats = this.mediaStreamsImpl.getMediaStats.bind(this.mediaStreamsImpl);
        this.stopMediaStats = this.mediaStreamsImpl.stopMediaStats.bind(this.mediaStreamsImpl);
    }
    Object.defineProperty(MediaStreams.prototype, "onRTPStat", {
        /**
         * Set a function to be called when media stats are generated
         * @param callback optionally, you can set a function on MediaStreams object. This will be treated as a default callback when media stats are generated if a callback function is not passed with `getMediaStats` function
         */
        set: function (callback) {
            this.mediaStreamsImpl.onRTPStat = callback;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MediaStreams.prototype, "onMediaConnectionStateChange", {
        /**
         * Set a function to be called when `peerConnetion` iceconnectionstatechange changes
         * @param callback function to be called when `peerConnetion` iceconnectionstatechange changes
         */
        set: function (callback) {
            this.mediaStreamsImpl.onMediaConnectionStateChange = callback;
        },
        enumerable: false,
        configurable: true
    });
    return MediaStreams;
}());
exports.MediaStreams = MediaStreams;
exports.default = MediaStreams;
/**
 * MediaStreams Implementation
 */
var MediaStreamsImpl = /** @class */ (function () {
    function MediaStreamsImpl(session) {
        this.ktag = 'MediaStreams';
        this.ktag = 'MediaStreams';
        if (!session) {
            throw new Error("".concat(this.ktag, ": Cannot initial media stream monitoring. Session is not passed"));
        }
        this.session = session;
        this.onMediaConnectionStateChange = null;
        this.onPeerConnectionStateChange = this.onPeerConnectionStateChange.bind(this);
        var sessionDescriptionHandler = this.session.sessionDescriptionHandler;
        sessionDescriptionHandler.peerConnection.addEventListener('iceconnectionstatechange', this.onPeerConnectionStateChange);
        this.isChrome = this.browser() === Browsers.Chrome;
        this.isFirefox = this.browser() === Browsers.Firefox;
        this.isSafari = this.browser() === Browsers.Safari;
        this.preRTT = { currentRoundTripTime: 0 };
        if (!this.isChrome && !this.isFirefox && !this.isSafari) {
            this.session.logger.error("".concat(this.ktag, " The web browser ").concat(this.browser(), " is not in the recommended list [Chrome, Safari, Firefox] !"));
        }
    }
    Object.defineProperty(MediaStreamsImpl.prototype, "tag", {
        get: function () {
            return this.ktag;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Function to find what browser is being used depending on the `navigator.userAgent` value
     * @returns Browsers enum value to denote what browser if being used
     */
    MediaStreamsImpl.prototype.browser = function () {
        if (navigator.userAgent.search('MSIE') >= 0) {
            return Browsers.MSIE;
        }
        else if (navigator.userAgent.search('Chrome') >= 0) {
            return Browsers.Chrome;
        }
        else if (navigator.userAgent.search('Firefox') >= 0) {
            return Browsers.Firefox;
        }
        else if (navigator.userAgent.search('Safari') >= 0 && navigator.userAgent.search('Chrome') < 0) {
            return Browsers.Safari;
        }
        else if (navigator.userAgent.search('Opera') >= 0) {
            return Browsers.Opera;
        }
        return 'unknown';
    };
    MediaStreamsImpl.prototype.mediaStatsTimerCallback = function () {
        var sessionDescriptionHandler = this.session.sessionDescriptionHandler;
        var peerConnection = sessionDescriptionHandler.peerConnection;
        if (!peerConnection) {
            this.session.logger.error("".concat(this.ktag, ": The peer connection cannot be null"));
            return;
        }
        var connectionState = peerConnection.iceConnectionState;
        if (connectionState !== 'connected' && connectionState !== 'completed') {
            this.preRTT.currentRoundTripTime = 0;
            return;
        }
        this.getRTPReport(new WebPhoneRTPReport());
    };
    MediaStreamsImpl.prototype.onPeerConnectionStateChange = function () {
        var eventName = 'unknown';
        var sessionDescriptionHandler = this.session.sessionDescriptionHandler;
        var state = sessionDescriptionHandler.peerConnection.iceConnectionState;
        if (ConnectionState.hasOwnProperty(state)) {
            eventName = ConnectionState[state];
            if (this.onMediaConnectionStateChange) {
                this.onMediaConnectionStateChange(eventName, this.session);
            }
            this.session.emit(eventName);
        }
        else {
            this.session.logger.debug("".concat(this.tag, ": Unknown peerConnection state: ").concat(state));
        }
        this.session.logger.debug("".concat(this.tag, ": peerConnection State: ").concat(state));
    };
    MediaStreamsImpl.prototype.getRTPReport = function (report) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionDescriptionHandler, peerConnection, stats, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionDescriptionHandler = this.session.sessionDescriptionHandler;
                        peerConnection = sessionDescriptionHandler.peerConnection;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, peerConnection.getStats()];
                    case 2:
                        stats = _a.sent();
                        stats.forEach(function (stat) {
                            switch (stat.type) {
                                case 'inbound-rtp':
                                    Object.keys(stat).forEach(function (statName) {
                                        switch (statName) {
                                            case 'bytesReceived':
                                            case 'packetsReceived':
                                            case 'jitter':
                                            case 'packetsLost':
                                            case 'fractionLost':
                                            case 'mediaType':
                                                report.inboundRtpReport[statName] = stat[statName];
                                                break;
                                            case 'roundTripTime':
                                                report.rttMs[statName] = stat[statName];
                                                break;
                                        }
                                    });
                                    break;
                                case 'outbound-rtp':
                                    Object.keys(stat).forEach(function (statName) {
                                        switch (statName) {
                                            case 'bytesSent':
                                            case 'packetsSent':
                                            case 'mediaType':
                                                report.outboundRtpReport[statName] = stat[statName];
                                                break;
                                        }
                                    });
                                    break;
                                case 'candidate-pair':
                                    Object.keys(stat).forEach(function (statName) {
                                        switch (statName) {
                                            case 'currentRoundTripTime':
                                                report.rttMs[statName] = stat[statName];
                                                break;
                                        }
                                    });
                                    break;
                                case 'local-candidate':
                                    var local_candidate_1 = {};
                                    Object.keys(stat).forEach(function (statName) {
                                        switch (statName) {
                                            case 'id':
                                            case 'isRemote':
                                            case 'ip':
                                            case 'candidateType':
                                            case 'networkType':
                                            case 'priority':
                                            case 'port':
                                                local_candidate_1[statName] = stat[statName];
                                                break;
                                        }
                                    });
                                    report.localCandidates.push(local_candidate_1);
                                    break;
                                case 'remote-candidate':
                                    var remote_candidate_1 = {};
                                    Object.keys(stat).forEach(function (statName) {
                                        switch (statName) {
                                            case 'id':
                                            case 'isRemote':
                                            case 'ip':
                                            case 'priority':
                                            case 'port':
                                            case 'candidateType':
                                                remote_candidate_1[statName] = stat[statName];
                                                break;
                                        }
                                    });
                                    report.remoteCandidates.push(remote_candidate_1);
                                    break;
                                case 'media-source':
                                    report.outboundRtpReport.rtpLocalAudioLevel = stat.audioLevel ? stat.audioLevel : 0;
                                    break;
                                case 'track':
                                    if (!stat.remoteSource) {
                                        break;
                                    }
                                    report.inboundRtpReport.rtpRemoteAudioLevel = stat.audioLevel ? stat.audioLevel : 0;
                                    break;
                                case 'transport':
                                    Object.keys(stat).forEach(function (statName) {
                                        switch (statName) {
                                            case 'dtlsState':
                                            case 'packetsSent':
                                            case 'packetsReceived':
                                            case 'selectedCandidatePairChanges':
                                            case 'selectedCandidatePairId':
                                                report.transport[statName] = stat[statName];
                                                break;
                                        }
                                    });
                                    break;
                                default:
                                    break;
                            }
                        });
                        if (!report.rttMs.hasOwnProperty('currentRoundTripTime')) {
                            if (!report.rttMs.hasOwnProperty('roundTripTime')) {
                                report.rttMs.currentRoundTripTime = this.preRTT.currentRoundTripTime;
                            }
                            else {
                                report.rttMs.currentRoundTripTime = report.rttMs.roundTripTime; // for Firefox
                                delete report.rttMs.roundTripTime;
                            }
                        }
                        else {
                            report.rttMs.currentRoundTripTime = Math.round(report.rttMs.currentRoundTripTime * 1000);
                        }
                        if (report.rttMs.hasOwnProperty('currentRoundTripTime')) {
                            this.preRTT.currentRoundTripTime = report.rttMs.currentRoundTripTime;
                        }
                        this.onRTPStat(report, this.session);
                        this.session.emit(events_1.Events.Session.RTPStat, report);
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        this.session.logger.error("".concat(this.tag, ": Unable to get media stats: ").concat(e_1.message));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @param callback function which will be called every time media stats are generated. Will override callback passed to `onRTPStat`
     * @param interval interval for the recurring call to the callback function
     * @returns
     */
    MediaStreamsImpl.prototype.getMediaStats = function (callback, interval) {
        var _this = this;
        if (callback === void 0) { callback = null; }
        if (interval === void 0) { interval = 1000; }
        if (!this.onRTPStat && !callback) {
            this.session.logger.debug("".concat(this.ktag, ": No event callback provided to call when media starts are generated"));
            return;
        }
        if (callback) {
            this.onRTPStat = callback;
        }
        if (this.mediaStatsTimer) {
            clearTimeout(this.mediaStatsTimer);
            this.mediaStatsTimer = null;
        }
        this.mediaStatsTimer = setInterval(function () {
            _this.mediaStatsTimerCallback();
        }, interval);
    };
    /**
     * Stop collecting stats. This will stop calling the registered function (either that was registered using `onRTPstat` or using `getMediaStats`)
     */
    MediaStreamsImpl.prototype.stopMediaStats = function () {
        if (this.mediaStatsTimer) {
            clearTimeout(this.mediaStatsTimer);
            this.onRTPStat = null;
        }
    };
    /**
     * Reconnect media and send reinvite on the existing session.
     *
     * This will also recreate SDP and send it over with the reinvite message
     */
    MediaStreamsImpl.prototype.reconnectMedia = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.session
                .reinvite()
                .then(function () { return resolve(); })
                .catch(reject);
        });
    };
    /**
     * Remove iceconnectionstatechange event listeners and stop collecting stats
     */
    MediaStreamsImpl.prototype.release = function () {
        if (this.mediaStatsTimer) {
            clearTimeout(this.mediaStatsTimer);
            this.mediaStatsTimer = null;
        }
        var sessionDescriptionHandler = this.session.sessionDescriptionHandler;
        if (!sessionDescriptionHandler.peerConnection) {
            return;
        }
        sessionDescriptionHandler.peerConnection.removeEventListener('iceconnectionstatechange', this.onPeerConnectionStateChange);
    };
    return MediaStreamsImpl;
}());
exports.MediaStreamsImpl = MediaStreamsImpl;
//# sourceMappingURL=mediaStreams.js.map