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
exports.createWebPhoneUserAgent = void 0;
var events_1 = require("events");
var sip_js_1 = require("sip.js");
var transport_1 = require("./transport");
var audioHelper_1 = require("./audioHelper");
var events_2 = require("./events");
var session_1 = require("./session");
var userAgentCore_1 = require("./userAgentCore");
/** @ignore */
function createWebPhoneUserAgent(configuration, sipInfo, options, id) {
    var extraConfiguration = {
        delegate: {
            onConnect: function () { return userAgent.register(); },
            onInvite: function (invitation) {
                userAgent.audioHelper.playIncoming(true);
                invitation.delegate = {};
                invitation.delegate.onSessionDescriptionHandler = function () { return (0, session_1.onSessionDescriptionHandlerCreated)(invitation); };
                (0, session_1.patchWebphoneSession)(invitation);
                (0, session_1.patchIncomingWebphoneSession)(invitation);
                invitation.logger.log('UA recieved incoming call invite');
                invitation.sendReceiveConfirm();
                userAgent.emit(events_2.Events.UserAgent.Invite, invitation);
            },
            onNotify: function (notification) {
                var event = notification.request.getHeader('Event');
                if (event === '') {
                    userAgent.emit(events_2.Events.UserAgent.ProvisionUpdate);
                }
                userAgent.logger.log('UA recieved notify');
                notification.accept();
            }
        }
    };
    var extendedConfiguration = Object.assign({}, extraConfiguration, configuration);
    var userAgent = new sip_js_1.UserAgent(extendedConfiguration);
    var eventEmitter = new events_1.EventEmitter();
    userAgent.on = eventEmitter.on.bind(eventEmitter);
    userAgent.off = eventEmitter.off.bind(eventEmitter);
    userAgent.once = eventEmitter.once.bind(eventEmitter);
    userAgent.addListener = eventEmitter.addListener.bind(eventEmitter);
    userAgent.removeListener = eventEmitter.removeListener.bind(eventEmitter);
    userAgent.defaultHeaders = ["P-rc-endpoint-id: ".concat(id), "Client-id: ".concat(options.appKey)];
    userAgent.regId = options.regId;
    userAgent.instanceId = options.instanceId;
    userAgent.media = {};
    userAgent.enableQos = options.enableQos;
    userAgent.enableMediaReportLogging = options.enableMediaReportLogging;
    userAgent.qosCollectInterval = options.qosCollectInterval;
    if (options.media && options.media.remote && options.media.local) {
        userAgent.media.remote = options.media.remote;
        userAgent.media.local = options.media.local;
    }
    else {
        userAgent.media = null;
    }
    userAgent.registerer = new sip_js_1.Registerer(userAgent, {
        regId: userAgent.regId,
        instanceId: userAgent.instanceId,
        extraHeaders: userAgent.defaultHeaders
    });
    userAgent.sipInfo = sipInfo;
    userAgent.modifiers = options.modifiers;
    userAgent.constraints = options.mediaConstraints;
    userAgent.earlyMedia = options.earlyMedia;
    userAgent.audioHelper = new audioHelper_1.AudioHelper(options.audioHelper);
    userAgent.onSession = options.onSession;
    userAgent._transport = (0, transport_1.createWebPhoneTransport)(userAgent.transport, options);
    userAgent.onTransportDisconnect = onTransportDisconnect.bind(userAgent);
    userAgent.emit = eventEmitter.emit.bind(eventEmitter);
    userAgent.register = register.bind(userAgent);
    userAgent.unregister = unregister.bind(userAgent);
    userAgent.invite = invite.bind(userAgent);
    userAgent.sendMessage = sendMessage.bind(userAgent);
    userAgent.createRcMessage = createRcMessage.bind(userAgent);
    userAgent.switchFrom = switchFrom.bind(userAgent);
    (0, userAgentCore_1.patchUserAgentCore)(userAgent);
    userAgent.start();
    userAgent.stateChange.addListener(function (newState) {
        switch (newState) {
            case sip_js_1.UserAgentState.Started: {
                userAgent.emit(events_2.Events.UserAgent.Started);
                break;
            }
            case sip_js_1.UserAgentState.Stopped: {
                userAgent.emit(events_2.Events.UserAgent.Stopped);
                break;
            }
        }
    });
    return userAgent;
}
exports.createWebPhoneUserAgent = createWebPhoneUserAgent;
function onTransportDisconnect(error) {
    // Patch it so that reconnection is managed by WebPhoneTransport
    if (this.state === sip_js_1.UserAgentState.Stopped) {
        return;
    }
    if (this.delegate && this.delegate.onDisconnect) {
        this.delegate.onDisconnect(error);
    }
    if (error) {
        this.transport.reconnect();
    }
}
function createRcMessage(options) {
    options.body = options.body || '';
    return ('<Msg>' +
        '<Hdr SID="' +
        options.sid +
        '" Req="' +
        options.request +
        '" From="' +
        options.from +
        '" To="' +
        options.to +
        '" Cmd="' +
        options.reqid +
        '"/> ' +
        '<Bdy Cln="' +
        this.sipInfo.authorizationId +
        '" ' +
        options.body +
        '/>' +
        '</Msg>');
}
function sendMessage(to, messageData) {
    var extraHeaders = ["P-rc-ws: ".concat(this.contact)];
    // For some reason, UserAgent.makeURI is unable to parse username starting with #
    // Fix in later release if this is fixed by SIP.js
    var user = to.split('@')[0];
    to = to.startsWith('#') ? "sip:".concat(to.substring(1)) : "sip:".concat(to);
    var uri = sip_js_1.UserAgent.makeURI(to);
    uri.user = user;
    var messager = new sip_js_1.Messager(this, uri, messageData, 'x-rc/agent', { extraHeaders: extraHeaders });
    return new Promise(function (resolve, reject) {
        messager.message({
            requestDelegate: {
                onAccept: resolve,
                onReject: reject
            }
        });
    });
}
function register() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.registerer.register({
                        requestDelegate: {
                            onAccept: function () {
                                _this.emit(events_2.Events.UserAgent.Registered);
                            },
                            onReject: function (response) {
                                if (!response) {
                                    return;
                                }
                                if (_this.transport.isSipErrorCode(response.message.statusCode)) {
                                    _this.transport.onSipErrorCode();
                                }
                                _this.logger.warn('UA Registration Failed');
                            }
                        }
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function unregister() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.registerer.unregister({
                        requestDelegate: {
                            onAccept: function () {
                                _this.emit(events_2.Events.UserAgent.Unregistered);
                            }
                        }
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function invite(number, options) {
    var _this = this;
    if (options === void 0) { options = {}; }
    var inviterOptions = {};
    inviterOptions.extraHeaders = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], (options.extraHeaders || []), true), this.defaultHeaders, true), [
        "P-Asserted-Identity: sip: ".concat((options.fromNumber || this.sipInfo.username) + '@' + this.sipInfo.domain)
    ], false), (options.homeCountryId ? ["P-rc-country-id: ".concat(options.homeCountryId)] : []), true);
    options.RTCConstraints =
        options.RTCConstraints || Object.assign({}, this.constraints, { optional: [{ DtlsSrtpKeyAgreement: 'true' }] });
    inviterOptions.sessionDescriptionHandlerModifiers = this.modifiers;
    inviterOptions.sessionDescriptionHandlerOptions = { constraints: options.RTCConstraints };
    inviterOptions.earlyMedia = this.earlyMedia;
    inviterOptions.delegate = {
        onSessionDescriptionHandler: function () { return (0, session_1.onSessionDescriptionHandlerCreated)(inviter); },
        onNotify: function (notification) { return notification.accept(); }
    };
    this.audioHelper.playOutgoing(true);
    this.logger.log("Invite to ".concat(number, " created with playOutgoing set to true"));
    var inviter = new sip_js_1.Inviter(this, sip_js_1.UserAgent.makeURI("sip:".concat(number, "@").concat(this.sipInfo.domain)), inviterOptions);
    inviter
        .invite({
        requestDelegate: {
            onAccept: function (inviteResponse) {
                inviter.startTime = new Date();
                inviter.emit(events_2.Events.Session.Accepted, inviteResponse);
            },
            onProgress: function (inviteResponse) {
                inviter.emit(events_2.Events.Session.Progress, inviteResponse);
            }
        }
    })
        .then(function () { return _this.emit(events_2.Events.UserAgent.InviteSent, inviter); })
        .catch(function (e) {
        if (e.message.indexOf('Permission denied') > -1) {
            inviter.emit(events_2.Events.Session.UserMediaFailed);
        }
        throw e;
    });
    (0, session_1.patchWebphoneSession)(inviter);
    return inviter;
}
/**
 * Support to switch call from other device to current web phone device
 * need active call information from details presence API for switching
 * https://developers.ringcentral.com/api-reference/Detailed-Extension-Presence-with-SIP-Event
 */
function switchFrom(activeCall, options) {
    if (options === void 0) { options = {}; }
    var replaceHeaders = [
        "Replaces: ".concat(activeCall.id, ";to-tag=").concat(activeCall.sipData.fromTag, ";from-tag=").concat(activeCall.sipData.toTag),
        'RC-call-type: replace'
    ];
    var _a = activeCall.direction === 'Outbound' ? [activeCall.to, activeCall.from] : [activeCall.from, activeCall.to], toNumber = _a[0], fromNumber = _a[1];
    options.extraHeaders = (options.extraHeaders || []).concat(replaceHeaders);
    options.fromNumber = options.fromNumber || fromNumber;
    var inviterOptions = {
        extraHeaders: options.extraHeaders,
        sessionDescriptionHandlerOptions: { constraints: options.RTCConstraints || this.constraints }
    };
    return this.invite(toNumber, inviterOptions);
}
//# sourceMappingURL=userAgent.js.map