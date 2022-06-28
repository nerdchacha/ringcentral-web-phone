"use strict";
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
exports.onSessionDescriptionHandlerCreated = exports.patchIncomingWebphoneSession = exports.patchWebphoneSession = exports.CommonSession = void 0;
var events_1 = require("events");
var sip_js_1 = require("sip.js");
var core_1 = require("sip.js/lib/core");
var session_state_1 = require("sip.js/lib/api/session-state");
var utils_1 = require("./utils");
var constants_1 = require("./constants");
var mediaStreams_1 = require("./mediaStreams");
var rtpReport_1 = require("./rtpReport");
var events_2 = require("./events");
var qos_1 = require("./qos");
var CommonSession = /** @class */ (function () {
    function CommonSession() {
    }
    return CommonSession;
}());
exports.CommonSession = CommonSession;
var mediaCheckTimer = 2000;
function patchWebphoneSession(session) {
    if (session.__patched) {
        return session;
    }
    session.__patched = true;
    session.held = false;
    session.muted = false;
    session.media = session.userAgent.media;
    session.__dispose = session.dispose.bind(session);
    session.dispose = dispose.bind(session);
    var eventEmitter = new events_1.EventEmitter();
    session.on = eventEmitter.on.bind(eventEmitter);
    session.off = eventEmitter.off.bind(eventEmitter);
    session.addListener = eventEmitter.addListener.bind(eventEmitter);
    session.removeListener = eventEmitter.removeListener.bind(eventEmitter);
    session.emit = eventEmitter.emit.bind(eventEmitter);
    session.sendInfoAndRecieveResponse = sendInfoAndRecieveResponse.bind(session);
    session.startRecord = startRecord.bind(session);
    session.stopRecord = stopRecord.bind(session);
    session.sendMoveResponse = sendMoveResponse.bind(session);
    session.park = park.bind(session);
    session.flip = flip.bind(session);
    session.whisper = whisper.bind(session);
    session.barge = barge.bind(session);
    session.mute = mute.bind(session);
    session.unmute = unmute.bind(session);
    session.addTrack = addTrack.bind(session);
    session.stopMediaStats = stopMediaStats.bind(session);
    session.warmTransfer = warmTransfer.bind(session);
    session.blindTransfer = blindTransfer.bind(session);
    session.transfer = transfer.bind(session);
    session.hold = hold.bind(session);
    session.unhold = unhold.bind(session);
    session.dtmf = dtmf.bind(session);
    session.reinvite = reinvite.bind(session);
    session.forward = forward.bind(session); // FIXME: Not needed?
    setupUserAgentCoreEvent(session);
    session.stateChange.addListener(function (newState) {
        switch (newState) {
            case session_state_1.SessionState.Establishing: {
                session.emit(events_2.Events.Session.Establishing);
                break;
            }
            case session_state_1.SessionState.Established: {
                stopPlaying(session);
                session.addTrack();
                session.emit(events_2.Events.Session.Established);
                break;
            }
            case session_state_1.SessionState.Terminating: {
                stopPlaying(session);
                stopMediaStreamStats(session);
                session.emit(events_2.Events.Session.Terminating);
                break;
            }
            case session_state_1.SessionState.Terminated: {
                stopPlaying(session);
                session.emit(events_2.Events.Session.Terminated);
                break;
            }
        }
    });
    // FIXME: Do we need this? The replaced session is part of existing sessions and would have already been patched
    // NEEDED - inviter.ts L191
    // session.on("replaced", patchWebphoneSession);
    if (session.userAgent.onSession) {
        session.userAgent.onSession(session);
    }
    session.mediaStatsStarted = false;
    session.noAudioReportCount = 0;
    session.reinviteForNoAudioSent = false;
    return session;
}
exports.patchWebphoneSession = patchWebphoneSession;
function patchIncomingWebphoneSession(session) {
    try {
        parseRcHeader(session);
    }
    catch (e) {
        session.logger.error("Can't parse RC headers from invite request due to " + e);
    }
    session.canUseRCMCallControl = canUseRCMCallControl.bind(session);
    session.createSessionMessage = createSessionMessage.bind(session);
    session.ignore = ignore.bind(session);
    session.replyWithMessage = replyWithMessage.bind(session);
    session.sendReceiveConfirm = sendReceiveConfirm.bind(session);
    session.sendSessionMessage = sendSessionMessage.bind(session);
    session.toVoicemail = toVoicemail.bind(session);
    session.__accept = session.accept.bind(session);
    session.accept = accept.bind(session);
    setupUserAgentCoreEvent(session);
}
exports.patchIncomingWebphoneSession = patchIncomingWebphoneSession;
function canUseRCMCallControl() {
    return !!this.rcHeaders;
}
function createSessionMessage(options) {
    if (!this.rcHeaders) {
        return undefined;
    }
    (0, utils_1.extend)(options, {
        sid: this.rcHeaders.sid,
        request: this.rcHeaders.request,
        from: this.rcHeaders.to,
        to: this.rcHeaders.from
    });
    return this.userAgent.createRcMessage(options);
}
function sendReceiveConfirm() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, this.sendSessionMessage(constants_1.messages.receiveConfirm)
                    .then(function (response) {
                    _this.logger.log('sendReceiveConfirm success');
                    return response;
                })
                    .catch(function (error) {
                    return _this.logger.error("failed to send receive confirmation via SIP MESSAGE due to ".concat(error.message));
                })];
        });
    });
}
function sendSessionMessage(options) {
    if (!this.rcHeaders) {
        this.logger.error("Can't send SIP MESSAGE related to session: no RC headers available");
    }
    return this.userAgent.sendMessage(this.rcHeaders.from, this.createSessionMessage(options));
}
function sendInfoAndRecieveResponse(command, options) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            options = options || {};
            (0, utils_1.extend)(command, options);
            delete command.extraHeaders;
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var requestDelegate = {
                        onAccept: function (response) {
                            var timeout = null;
                            var _a = response.message, statusCode = _a.statusCode, callId = _a.callId;
                            if (statusCode === 200) {
                                var onInfo_1 = function (message) {
                                    // FIXME: I think we need this check here
                                    if (message.callId !== callId) {
                                        return;
                                    }
                                    var body = (message && message.body) || '{}';
                                    var obj;
                                    try {
                                        obj = JSON.parse(body);
                                    }
                                    catch (e) {
                                        obj = {};
                                    }
                                    if (obj.response && obj.response.command === command.command && obj.response.result) {
                                        timeout && clearTimeout(timeout);
                                        _this.off('RC_SIP_INFO', onInfo_1);
                                        if (obj.response.result.code.toString() === '0') {
                                            return resolve(obj.response.result);
                                        }
                                        return reject(obj.response.result);
                                    }
                                };
                                timeout = setTimeout(function () {
                                    reject(new Error('Timeout: no reply'));
                                    _this.off('RC_SIP_INFO', onInfo_1);
                                }, constants_1.responseTimeout);
                                _this.on('RC_SIP_INFO', onInfo_1);
                            }
                            else {
                                reject(new Error("The INFO response status code is: ".concat(statusCode, " (waiting for 200)")));
                            }
                        },
                        onReject: function (response) {
                            reject(new Error("The INFO response status code is: ".concat(response.message.statusCode, " (waiting for 200)")));
                        }
                    };
                    var requestOptions = {
                        extraHeaders: __spreadArray(__spreadArray([], (options.extraHeaders || []), true), _this.userAgent.defaultHeaders, true),
                        body: (0, core_1.fromBodyLegacy)({
                            body: JSON.stringify({ request: command }),
                            contentType: 'application/json;charset=utf-8'
                        })
                    };
                    _this.info({ requestDelegate: requestDelegate, requestOptions: requestOptions });
                })];
        });
    });
}
function startRecord() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, setRecord(this, true)];
        });
    });
}
function stopRecord() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, setRecord(this, false)];
        });
    });
}
function sendMoveResponse(reqId, code, description, options) {
    if (options === void 0) { options = {}; }
    var extraHeaders = options.extraHeaders || [];
    var requestOptions = {
        extraHeaders: __spreadArray(__spreadArray([], extraHeaders, true), this.userAgent.defaultHeaders, true),
        body: (0, core_1.fromBodyLegacy)({
            body: JSON.stringify({
                response: {
                    reqId: reqId,
                    command: 'move',
                    result: {
                        code: code,
                        description: description
                    }
                }
            }),
            contentType: 'application/json;charset=utf-8'
        })
    };
    this.info({ requestOptions: requestOptions });
}
function ignore() {
    var _this = this;
    return this.sendReceiveConfirm().then(function () { return _this.sendSessionMessage(constants_1.messages.ignore); });
}
function toVoicemail() {
    var _this = this;
    return this.sendReceiveConfirm().then(function () { return _this.sendSessionMessage(constants_1.messages.toVoicemail); });
}
function replyWithMessage(replyOptions) {
    var _this = this;
    var body = 'RepTp="' + replyOptions.replyType + '"';
    if (replyOptions.replyType === 0) {
        body += ' Bdy="' + replyOptions.replyText + '"';
    }
    else if (replyOptions.replyType === 1 || replyOptions.replyType === 4) {
        body += ' Vl="' + replyOptions.timeValue + '"';
        body += ' Units="' + replyOptions.timeUnits + '"';
        body += ' Dir="' + replyOptions.callbackDirection + '"';
    }
    return this.sendReceiveConfirm().then(function () {
        return _this.sendSessionMessage({ reqid: constants_1.messages.replyWithMessage.reqid, body: body });
    });
}
function flip(target) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, this.sendInfoAndRecieveResponse(constants_1.messages.flip, { target: target })];
        });
    });
}
function whisper() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, this.sendInfoAndRecieveResponse(constants_1.messages.whisper)];
        });
    });
}
function barge() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, this.sendInfoAndRecieveResponse(constants_1.messages.barge)];
        });
    });
}
function park() {
    return this.sendInfoAndRecieveResponse(constants_1.messages.park);
}
function mute(silent) {
    if (this.state !== session_state_1.SessionState.Established) {
        this.logger.warn('An active session is required to mute audio');
        return;
    }
    if (this.muted) {
        this.logger.debug('Session already muted');
        return;
    }
    this.logger.log('Muting Audio');
    enableSenderTracks(this, false);
    this.muted = true;
    if (!silent) {
        this.emit(events_2.Events.Session.Muted, this);
    }
}
function unmute(silent) {
    if (this.state !== session_state_1.SessionState.Established) {
        this.logger.warn('An active session is required to unmute audio');
        return;
    }
    if (!this.muted) {
        this.logger.debug('Session not muted');
        return;
    }
    this.logger.log('Unmuting Audio');
    enableSenderTracks(this, true);
    this.muted = false;
    if (!silent) {
        this.emit(events_2.Events.Session.Unmuted, this);
    }
}
function addTrack(remoteAudioEle, localAudioEle) {
    var _this = this;
    var sessionDescriptionHandler = this.sessionDescriptionHandler;
    var peerConnection = sessionDescriptionHandler.peerConnection;
    var remoteAudio;
    var localAudio;
    if (remoteAudioEle && localAudioEle) {
        remoteAudio = remoteAudioEle;
        localAudio = localAudioEle;
    }
    else if (this.media) {
        remoteAudio = this.media.remote;
        localAudio = this.media.local;
    }
    else {
        throw new Error('HTML Media Element not Defined');
    }
    // TODO: peerConnecton.remoteMediaStream already has reciver track added thanks to default session description handler. Can we remove this code?
    var remoteStream = new MediaStream();
    if (peerConnection.getReceivers) {
        peerConnection.getReceivers().forEach(function (receiver) {
            var rtrack = receiver.track;
            if (rtrack) {
                remoteStream.addTrack(rtrack);
                _this.logger.log('Remote track added');
            }
        });
    }
    else {
        remoteStream = sessionDescriptionHandler.remoteMediaStream;
        this.logger.log('Remote track added');
    }
    remoteAudio.srcObject = remoteStream;
    remoteAudio.play().catch(function () {
        _this.logger.error('Remote play was rejected');
    });
    // TODO: peerConnecton.localMediaStream already has sender track added thanks to default session description handler. Can we remove this code?
    var localStream = new MediaStream();
    if (peerConnection.getSenders) {
        peerConnection.getSenders().forEach(function (sender) {
            var strack = sender.track;
            if (strack && strack.kind === 'audio') {
                localStream.addTrack(strack);
                _this.logger.log('Local track added');
            }
        });
    }
    else {
        localStream = sessionDescriptionHandler.localMediaStream;
        this.logger.log('Local track added');
    }
    localAudio.srcObject = localStream;
    localAudio.play().catch(function () {
        _this.logger.error('Local play was rejected');
    });
    if (localStream && remoteStream && !this.mediaStatsStarted) {
        this.mediaStreams = new mediaStreams_1.MediaStreams(this);
        this.logger.log('Start gathering media report');
        this.mediaStatsStarted = true;
        this.mediaStreams.getMediaStats(function (report) {
            if (_this.userAgent.enableMediaReportLogging) {
                _this.logger.log("Got media report: ".concat(JSON.stringify(report)));
            }
            if (!_this.reinviteForNoAudioSent && (0, rtpReport_1.isNoAudio)(report)) {
                _this.logger.log('No audio report');
                _this.noAudioReportCount++;
                if (_this.noAudioReportCount === 3) {
                    _this.logger.log('No audio for 6 sec. Trying to recover audio by sending Re-invite');
                    _this.mediaStreams.reconnectMedia();
                    _this.reinviteForNoAudioSent = true;
                    _this.noAudioReportCount = 0;
                }
            }
            else if (!(0, rtpReport_1.isNoAudio)(report)) {
                _this.noAudioReportCount = 0;
            }
        }, mediaCheckTimer);
    }
}
function stopMediaStats() {
    this.logger.log('Stopping media stats collection');
    if (!this) {
        return;
    }
    this.mediaStreams && this.mediaStreams.stopMediaStats();
    this.mediaStatsStarted = false;
    this.noAudioReportCount = 0;
}
function blindTransfer(target, options) {
    if (options === void 0) { options = {}; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            this.logger.log('Call transfer initiated');
            target = typeof target === 'string' ? sip_js_1.UserAgent.makeURI("sip:".concat(target, "@").concat(this.userAgent.sipInfo.domain)) : target;
            return [2 /*return*/, Promise.resolve(this.refer(target, options))];
        });
    });
}
function warmTransfer(target, options) {
    if (options === void 0) { options = { requestOptions: { extraHeaders: [] } }; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            options.requestOptions.extraHeaders = (options.requestOptions.extraHeaders || []).concat(this.userAgent.defaultHeaders);
            target = typeof target === 'string' ? sip_js_1.UserAgent.makeURI("sip:".concat(target, "@").concat(this.userAgent.sipInfo.domain)) : target;
            this.logger.log('Completing warm transfer');
            return [2 /*return*/, Promise.resolve(this.refer(target, options))];
        });
    });
}
function transfer(target, options) {
    if (options === void 0) { options = { requestOptions: { extraHeaders: [] } }; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            options.requestOptions.extraHeaders = (options.requestOptions.extraHeaders || []).concat(this.userAgent.defaultHeaders);
            return [2 /*return*/, this.blindTransfer(target, options)];
        });
    });
}
/**
 *
 * @param this WebPhoneSessionSessionInviteOptions
 * @param options
 * @returns Promise<OutgoingInviteRequest>
 *
 * Sends a reinvite. Also makes sure to regenrate a new SDP by passing offerToReceiveAudio: true, offerToReceiveVideo: false  and iceRestart: true
 * Once the SDP is ready, the local description is set and the SDP is sent to the remote peer along with an INVITE request
 */
function reinvite(options) {
    var _this = this;
    var _a;
    if (options === void 0) { options = {}; }
    options.sessionDescriptionHandlerOptions = Object.assign({}, options.sessionDescriptionHandlerOptions, {
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
        iceRestart: true
    });
    options.requestDelegate = options.requestDelegate || {};
    var originalOnAccept = (_a = options.requestDelegate.onAccept) === null || _a === void 0 ? void 0 : _a.bind(options.requestDelegate);
    options.requestDelegate.onAccept = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        patchIncomingWebphoneSession(_this);
        originalOnAccept && originalOnAccept.apply(void 0, args);
    };
    return this.invite(options);
}
function hold() {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    this.stopMediaStats();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    this.logger.log('Hold Initiated');
                    return [4 /*yield*/, setHold(this, true)];
                case 2:
                    _a.sent();
                    this.logger.log('Hold completed, held is set to true');
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    throw new Error('Hold could not be completed');
                case 4: return [2 /*return*/];
            }
        });
    });
}
function unhold() {
    return __awaiter(this, void 0, void 0, function () {
        var e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    this.logger.log('Unhold Initiated');
                    return [4 /*yield*/, setHold(this, false)];
                case 1:
                    _a.sent();
                    this.logger.log('Unhold completed, held is set to false');
                    return [3 /*break*/, 3];
                case 2:
                    e_2 = _a.sent();
                    throw new Error('Unhold could not be completed');
                case 3: return [2 /*return*/];
            }
        });
    });
}
function dtmf(dtmf, duration, interToneGap) {
    if (duration === void 0) { duration = 100; }
    if (interToneGap === void 0) { interToneGap = 50; }
    duration = parseInt(duration.toString());
    interToneGap = parseInt(interToneGap.toString());
    var sessionDescriptionHandler = this.sessionDescriptionHandler;
    var peerConnection = sessionDescriptionHandler.peerConnection;
    if (!peerConnection) {
        this.logger.error('Peer connection closed.');
        return;
    }
    var senders = peerConnection.getSenders();
    var audioSender = senders.find(function (sender) { return sender.track && sender.track.kind === 'audio'; });
    var dtmfSender = audioSender.dtmf;
    if (dtmfSender !== undefined && dtmfSender) {
        this.logger.log("Send DTMF: ".concat(dtmf, " Duration: ").concat(duration, " InterToneGap: ").concat(interToneGap));
        return dtmfSender.insertDTMF(dtmf, duration, interToneGap);
    }
    var sender = dtmfSender && !dtmfSender.canInsertDTMF ? "can't insert DTMF" : 'Unknown';
    throw new Error('Send DTMF failed: ' + (!dtmfSender ? 'no sender' : sender));
}
function accept(options) {
    var _this = this;
    if (options === void 0) { options = {}; }
    options = options || {};
    options.extraHeaders = (options.extraHeaders || []).concat(this.userAgent.defaultHeaders);
    options.sessionDescriptionHandlerOptions = Object.assign({}, options.sessionDescriptionHandlerOptions);
    options.sessionDescriptionHandlerOptions.constraints =
        options.sessionDescriptionHandlerOptions.constraints ||
            Object.assign({}, this.userAgent.constraints, { optional: [{ DtlsSrtpKeyAgreement: 'true' }] });
    return new Promise(function (resolve, reject) {
        try {
            _this.__accept(options);
            _this.startTime = new Date();
            _this.emit(events_2.Events.Session.Accepted, _this.request);
            resolve(_this);
        }
        catch (e) {
            reject(e);
        }
    });
}
function forward(target, acceptOptions, transferOptions) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.accept(acceptOptions)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, new Promise(function (resolve) {
                            _this.mute();
                            setTimeout(function () {
                                resolve(_this.transfer(target, transferOptions));
                            }, 700);
                        })];
            }
        });
    });
}
function dispose() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            stopMediaStreamStats(this);
            this.__dispose();
            return [2 /*return*/];
        });
    });
}
/* ---------------------------------------------------------- HELPER FUNCTIONS ---------------------------------------------------------- */
function parseRcHeaderString(str) {
    if (str === void 0) { str = ''; }
    var pairs = str.split(/; */).filter(function (pair) { return pair.includes('='); }); // skip things that don't look like key=value
    return pairs.reduce(function (seed, pair) {
        var _a = pair.split('='), key = _a[0], value = _a[1];
        key = key.trim();
        value = value.trim();
        // only assign once
        seed[key] = seed[key] || value;
        return seed;
    }, {});
}
function parseRcHeader(session) {
    var prc = session.request.getHeader('P-Rc');
    var prcCallInfo = session.request.getHeader('P-Rc-Api-Call-Info');
    if (prc) {
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(prc, 'text/xml');
        var hdrNode = xmlDoc.getElementsByTagName('Hdr')[0];
        var bdyNode = xmlDoc.getElementsByTagName('Bdy')[0];
        if (hdrNode) {
            session.rcHeaders = {
                sid: hdrNode.getAttribute('SID'),
                request: hdrNode.getAttribute('Req'),
                from: hdrNode.getAttribute('From'),
                to: hdrNode.getAttribute('To')
            };
        }
        if (bdyNode) {
            (0, utils_1.extend)(session.rcHeaders, {
                srvLvl: bdyNode.getAttribute('SrvLvl'),
                srvLvlExt: bdyNode.getAttribute('SrvLvlExt'),
                nm: bdyNode.getAttribute('Nm'),
                toNm: bdyNode.getAttribute('ToNm')
            });
        }
    }
    if (prcCallInfo) {
        var parsed = parseRcHeaderString(prcCallInfo);
        (0, utils_1.extend)(session.rcHeaders, parsed);
    }
}
function setRecord(session, flag) {
    return __awaiter(this, void 0, void 0, function () {
        var message, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = flag ? constants_1.messages.startRecord : constants_1.messages.stopRecord;
                    if (!((session.__isRecording && !flag) || (!session.__isRecording && flag))) return [3 /*break*/, 2];
                    return [4 /*yield*/, session.sendInfoAndRecieveResponse(message)];
                case 1:
                    data = _a.sent();
                    session.__isRecording = !!flag;
                    return [2 /*return*/, data];
                case 2: return [2 /*return*/];
            }
        });
    });
}
function enableReceiverTracks(session, enable) {
    var sessionDescriptionHandler = session.sessionDescriptionHandler;
    var peerConnection = sessionDescriptionHandler.peerConnection;
    if (!peerConnection) {
        session.logger.error('Peer connection closed.');
        return;
    }
    peerConnection.getReceivers().forEach(function (receiver) {
        if (receiver.track) {
            receiver.track.enabled = enable;
        }
    });
}
function enableSenderTracks(session, enable) {
    var sessionDescriptionHandler = session.sessionDescriptionHandler;
    var peerConnection = sessionDescriptionHandler.peerConnection;
    if (!peerConnection) {
        session.logger.error('Peer connection closed.');
        return;
    }
    peerConnection.getSenders().forEach(function (sender) {
        if (sender.track) {
            sender.track.enabled = enable;
        }
    });
}
function setHold(session, hold) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        // Just resolve if we are already in correct state
        if (session.held === hold) {
            return resolve();
        }
        var options = {
            requestDelegate: {
                onAccept: function (response) { return __awaiter(_this, void 0, void 0, function () {
                    var sdp, match, direction;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                session.held = hold;
                                return [4 /*yield*/, session.sessionDescriptionHandler.getDescription()];
                            case 1:
                                sdp = (_a.sent()).body;
                                match = sdp.match(/a=(sendrecv|sendonly|recvonly|inactive)/);
                                direction = match ? match[1] : '';
                                session.__localHold = response.message.statusCode === 200 && direction === 'sendonly';
                                session.logger.log('localhold is set to ' + session.__localHold);
                                enableReceiverTracks(session, !session.held);
                                enableSenderTracks(session, !session.held && !session.muted);
                                resolve();
                                return [2 /*return*/];
                        }
                    });
                }); },
                onReject: function () {
                    session.logger.warn('re-invite request was rejected');
                    enableReceiverTracks(session, !session.held);
                    enableSenderTracks(session, !session.held && !session.muted);
                    reject();
                }
            }
        };
        // Session properties used to pass options to the SessionDescriptionHandler:
        //
        // 1) Session.sessionDescriptionHandlerOptions
        //    SDH options for the initial INVITE transaction.
        //    - Used in all cases when handling the initial INVITE transaction as either UAC or UAS.
        //    - May be set directly at anytime.
        //    - May optionally be set via constructor option.
        //    - May optionally be set via options passed to Inviter.invite() or Invitation.accept().
        //
        // 2) Session.sessionDescriptionHandlerOptionsReInvite
        //    SDH options for re-INVITE transactions.
        //    - Used in all cases when handling a re-INVITE transaction as either UAC or UAS.
        //    - May be set directly at anytime.
        //    - May optionally be set via constructor option.
        //    - May optionally be set via options passed to Session.invite().
        var sessionDescriptionHandlerOptions = session.sessionDescriptionHandlerOptionsReInvite;
        sessionDescriptionHandlerOptions.hold = hold;
        session.sessionDescriptionHandlerOptionsReInvite = sessionDescriptionHandlerOptions;
        // Send re-INVITE
        session
            .invite(options)
            .then(function () {
            // preemptively enable/disable tracks
            enableReceiverTracks(session, !hold);
            enableSenderTracks(session, !hold && !session.muted);
        })
            .catch(function (error) {
            if (error instanceof sip_js_1.RequestPendingError) {
                session.logger.error("A hold request is already in progress.");
            }
            reject(error);
        });
    });
}
function stopPlaying(session) {
    session.userAgent.audioHelper.playOutgoing(false);
    session.userAgent.audioHelper.playIncoming(false);
}
function onSessionDescriptionHandlerCreated(session) {
    if (!session.userAgent.enableQos) {
        return;
    }
    session.logger.log('SessionDescriptionHandler created');
    (0, qos_1.startQosStatsCollection)(session);
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
        devices.forEach(function (device) {
            return session.logger.log("".concat(device.kind, " = ").concat(device.label, " ").concat(JSON.stringify(device)));
        });
    });
}
exports.onSessionDescriptionHandlerCreated = onSessionDescriptionHandlerCreated;
function setupUserAgentCoreEvent(session) {
    if (session.__userAgentCoreEventsSetup) {
        return;
    }
    var userAgentCore = session.userAgent.userAgentCore;
    userAgentCore.on(events_2.Events.Session.UpdateReceived, function (payload) { return session.emit(events_2.Events.Session.UpdateReceived, payload); });
    userAgentCore.on(events_2.Events.Session.MoveToRcv, function (payload) { return session.emit(events_2.Events.Session.MoveToRcv, payload); });
    // RC_SIP_INFO event is for internal use
    userAgentCore.on('RC_SIP_INFO', function (payload) { return session.emit('RC_SIP_INFO', payload); });
    session.__userAgentCoreEventsSetup = true;
}
function stopMediaStreamStats(session) {
    if (session.mediaStreams) {
        session.logger.log('Releasing media streams');
        session.mediaStreams.release();
    }
}
function onLocalHold() {
    return this.__localHold;
}
//# sourceMappingURL=session.js.map