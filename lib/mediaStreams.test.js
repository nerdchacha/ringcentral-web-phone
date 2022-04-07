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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = __importDefault(require("events"));
var faker_1 = require("@faker-js/faker"); // eslint-disable-line import/no-unresolved
var mediaStreams_1 = __importStar(require("../src/mediaStreams"));
var events_2 = require("./events");
// #region Mocks
var MockNavigator = /** @class */ (function () {
    function MockNavigator() {
        this._userAgent = 'Chrome/5.0 (Windows; U; Win98; en-US; rv:0.9.2) Gecko/20010725';
    }
    Object.defineProperty(MockNavigator.prototype, "userAgent", {
        get: function () {
            return this._userAgent;
        },
        enumerable: false,
        configurable: true
    });
    return MockNavigator;
}());
var MockLogger = /** @class */ (function () {
    function MockLogger() {
        this.log = function () { return null; };
        this.debug = function () { return null; };
        this.error = function () { return null; };
        this.info = function () { return null; };
    }
    return MockLogger;
}());
var MockSessionDescriptionHandler = /** @class */ (function () {
    function MockSessionDescriptionHandler() {
        this.peerConnection = new MockPeerConnection();
    }
    return MockSessionDescriptionHandler;
}());
var MockUserAgent = /** @class */ (function () {
    function MockUserAgent() {
        this.logger = new MockLogger();
        this.defaultHeaders = {};
    }
    return MockUserAgent;
}());
var MockSession = /** @class */ (function () {
    function MockSession() {
        this.eventEmitter = new events_1.default();
        this.sessionDescriptionHandler = new MockSessionDescriptionHandler();
        this.userAgent = new MockUserAgent();
        this.logger = new MockLogger();
    }
    MockSession.prototype.emit = function (event, parameter) {
        this.eventEmitter.emit(event, parameter);
    };
    MockSession.prototype.on = function (event, callback) {
        this.eventEmitter.on(event, callback);
    };
    MockSession.prototype.reinvite = function () { };
    return MockSession;
}());
var MockPeerConnection = /** @class */ (function () {
    function MockPeerConnection() {
        this.eventEmitter = new events_1.default();
        this.connectionState = 'new';
    }
    Object.defineProperty(MockPeerConnection.prototype, "iceConnectionState", {
        get: function () {
            return this.connectionState;
        },
        set: function (state) {
            this.connectionState = state;
        },
        enumerable: false,
        configurable: true
    });
    MockPeerConnection.prototype.getStats = function () {
        return new Promise(function (resolve, reject) {
            resolve(MockPeerConnection.defaultStats);
        });
    };
    MockPeerConnection.prototype.addEventListener = function (eventName, listener) {
        this.eventEmitter.addListener(eventName, listener);
    };
    MockPeerConnection.prototype.removeEventListener = function (eventName, listener) {
        this.eventEmitter.removeListener(eventName, listener);
    };
    MockPeerConnection.prototype.emit = function (eventName, data) {
        this.eventEmitter.emit(eventName, data);
    };
    MockPeerConnection.iceConnectionStates = {
        new: 'mediaConnectionStateNew',
        checking: 'mediaConnectionStateChecking',
        connected: 'mediaConnectionStateConnected',
        completed: 'mediaConnectionStateCompleted',
        failed: 'mediaConnectionStateFailed',
        disconnected: 'mediaConnectionStateDisconnected',
        closed: 'mediaConnectionStateClosed'
    };
    MockPeerConnection.defaultStats = [
        {
            type: 'inbound-rtp',
            bytesReceived: 100,
            packetsReceived: 200,
            jitter: 300,
            packetsLost: 400,
            fractionLost: 500,
            mediaType: 'audio'
        },
        {
            type: 'outbound-rtp',
            bytesSent: 100,
            packetsSent: 200,
            mediaType: 'audio'
        },
        {
            type: 'candidate-pair',
            currentRoundTripTime: 1.05
        }
    ];
    return MockPeerConnection;
}());
var MockRTPStats = /** @class */ (function () {
    function MockRTPStats(type, properties) {
        if (properties === void 0) { properties = {}; }
        var result;
        switch (type) {
            case 'inbound-rtp':
                result = {
                    type: type,
                    bytesReceived: faker_1.faker.datatype.number(),
                    packetsReceived: faker_1.faker.datatype.number(),
                    jitter: faker_1.faker.datatype.number(),
                    packetsLost: faker_1.faker.datatype.number(),
                    fractionLost: faker_1.faker.datatype.number(),
                    mediaType: faker_1.faker.random.word(),
                    roundTripTime: faker_1.faker.datatype.number()
                };
                break;
            case 'outbound-rtp':
                result = {
                    type: type,
                    bytesSent: faker_1.faker.datatype.number(),
                    packetsSent: faker_1.faker.datatype.number(),
                    mediaType: faker_1.faker.random.word()
                };
                break;
            case 'candidate-pair':
                result = {
                    type: type,
                    currentRoundTripTime: faker_1.faker.datatype.number()
                };
                break;
            case 'local-candidate':
                result = {
                    type: type,
                    id: faker_1.faker.datatype.number(),
                    isRemote: faker_1.faker.datatype.boolean(),
                    ip: faker_1.faker.internet.ip(),
                    candidateType: faker_1.faker.random.word(),
                    networkType: faker_1.faker.random.word(),
                    priority: faker_1.faker.datatype.number(),
                    port: faker_1.faker.internet.port()
                };
                break;
            case 'remote-candidate':
                result = {
                    type: type,
                    id: faker_1.faker.datatype.number(),
                    isRemote: faker_1.faker.datatype.boolean(),
                    ip: faker_1.faker.internet.ip(),
                    candidateType: faker_1.faker.random.word(),
                    priority: faker_1.faker.datatype.number(),
                    port: faker_1.faker.internet.port()
                };
                break;
            case 'media-source':
            case 'track':
                result = {
                    type: type,
                    audioLevel: faker_1.faker.datatype.number({ min: 0, max: 100 })
                };
                break;
            case 'transport':
                result = {
                    type: type,
                    dtlsState: faker_1.faker.random.word(),
                    packetsSent: faker_1.faker.datatype.number(),
                    packetsReceived: faker_1.faker.datatype.number(),
                    selectedCandidatePairChanges: faker_1.faker.datatype.boolean(),
                    selectedCandidatePairId: faker_1.faker.datatype.number()
                };
                break;
        }
        return Object.assign({}, result, properties);
    }
    return MockRTPStats;
}());
// #endregion
global.navigator = new MockNavigator();
function generateMockStatAndReport() {
    var inboundRTP = new MockRTPStats('inbound-rtp');
    var outboundRTP = new MockRTPStats('outbound-rtp');
    var candidatePair = new MockRTPStats('candidate-pair');
    var localCandidate = new MockRTPStats('local-candidate');
    var remoteCandidate = new MockRTPStats('remote-candidate');
    var mediaSource = new MockRTPStats('media-source');
    var track = new MockRTPStats('track');
    var transport = new MockRTPStats('transport');
    var mockStat = [
        inboundRTP,
        outboundRTP,
        candidatePair,
        localCandidate,
        remoteCandidate,
        mediaSource,
        track,
        transport
    ];
    var mockReport = new mediaStreams_1.WebPhoneRTPReport();
    mockReport.outboundRtpReport = {
        bytesSent: outboundRTP.bytesSent,
        packetsSent: outboundRTP.packetsSent,
        mediaType: outboundRTP.mediaType,
        rtpLocalAudioLevel: mediaSource.audioLevel
    };
    mockReport.inboundRtpReport = {
        bytesReceived: inboundRTP.bytesReceived,
        packetsReceived: inboundRTP.packetsReceived,
        jitter: inboundRTP.jitter,
        packetsLost: inboundRTP.packetsLost,
        fractionLost: inboundRTP.fractionLost,
        mediaType: inboundRTP.mediaType
    };
    mockReport.rttMs = {
        roundTripTime: inboundRTP.roundTripTime,
        currentRoundTripTime: candidatePair.currentRoundTripTime * 1000
    };
    mockReport.localCandidates = [
        {
            id: localCandidate.id,
            isRemote: localCandidate.isRemote,
            ip: localCandidate.ip,
            candidateType: localCandidate.candidateType,
            networkType: localCandidate.networkType,
            priority: localCandidate.priority,
            port: localCandidate.port
        }
    ];
    mockReport.remoteCandidates = [
        {
            id: remoteCandidate.id,
            isRemote: remoteCandidate.isRemote,
            ip: remoteCandidate.ip,
            candidateType: remoteCandidate.candidateType,
            priority: remoteCandidate.priority,
            port: remoteCandidate.port
        }
    ];
    mockReport.transport = {
        dtlsState: transport.dtlsState,
        packetsSent: transport.packetsSent,
        packetsReceived: transport.packetsReceived,
        selectedCandidatePairChanges: transport.selectedCandidatePairChanges,
        selectedCandidatePairId: transport.selectedCandidatePairId
    };
    return { mockStat: mockStat, mockReport: mockReport };
}
describe('MediaStreamsImpl', function () {
    afterEach(function () {
        jest.restoreAllMocks();
    });
    test('throw error if MediaStreamsImpl is instantiated with no session', function () {
        expect(function () { return new mediaStreams_1.MediaStreamsImpl(null); }).toThrow();
        expect(function () { return new mediaStreams_1.MediaStreamsImpl(undefined); }).toThrow();
    });
    test('browser function should check for correct browser type as per the useragent', function () {
        var mockSession = new MockSession();
        var mediaStreamsImpl = new mediaStreams_1.MediaStreamsImpl(mockSession);
        jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Firefox/5.0 (Windows; U; Win98; en-US; rv:0.9.2) Gecko/20010725');
        expect(mediaStreamsImpl.browser()).toBe(mediaStreams_1.Browsers.Firefox);
        jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Safari/5.0 (Windows; U; Win98; en-US; rv:0.9.2) Gecko/20010725');
        expect(mediaStreamsImpl.browser()).toBe(mediaStreams_1.Browsers.Safari);
        jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Opera/5.0 (Windows; U; Win98; en-US; rv:0.9.2) Gecko/20010725');
        expect(mediaStreamsImpl.browser()).toBe(mediaStreams_1.Browsers.Opera);
        jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue('MSIE/5.0 (Windows; U; Win98; en-US; rv:0.9.2) Gecko/20010725');
        expect(mediaStreamsImpl.browser()).toBe(mediaStreams_1.Browsers.MSIE);
    });
    test('should emit event on session and trigger onMediaConnectionStateChange on iceconnectionstatechange', function () {
        var mockSession = new MockSession();
        var mediaStreamsImpl = new mediaStreams_1.MediaStreamsImpl(mockSession);
        var mockOnMediaConnectionStateChange = jest.fn();
        mediaStreamsImpl.onMediaConnectionStateChange = mockOnMediaConnectionStateChange;
        var mediaConnectionStateNew = jest.fn();
        var mediaConnectionStateChecking = jest.fn();
        var mediaConnectionStateConnected = jest.fn();
        var mediaConnectionStateCompleted = jest.fn();
        var mediaConnectionStateFailed = jest.fn();
        var mediaConnectionStateDisconnected = jest.fn();
        var mediaConnectionStateClosed = jest.fn();
        mockSession.on('mediaConnectionStateNew', mediaConnectionStateNew);
        mockSession.on('mediaConnectionStateChecking', mediaConnectionStateChecking);
        mockSession.on('mediaConnectionStateConnected', mediaConnectionStateConnected);
        mockSession.on('mediaConnectionStateCompleted', mediaConnectionStateCompleted);
        mockSession.on('mediaConnectionStateFailed', mediaConnectionStateFailed);
        mockSession.on('mediaConnectionStateDisconnected', mediaConnectionStateDisconnected);
        mockSession.on('mediaConnectionStateClosed', mediaConnectionStateClosed);
        jest.spyOn(mockSession.sessionDescriptionHandler.peerConnection, 'iceConnectionState', 'get').mockReturnValue('new');
        mockSession.sessionDescriptionHandler.peerConnection.emit('iceconnectionstatechange', null);
        expect(mockOnMediaConnectionStateChange).toBeCalledWith('mediaConnectionStateNew', mockSession);
        expect(mediaConnectionStateNew).toBeCalled();
        jest.spyOn(mockSession.sessionDescriptionHandler.peerConnection, 'iceConnectionState', 'get').mockReturnValue('checking');
        mockSession.sessionDescriptionHandler.peerConnection.emit('iceconnectionstatechange', null);
        expect(mockOnMediaConnectionStateChange).toBeCalledWith('mediaConnectionStateChecking', mockSession);
        expect(mediaConnectionStateChecking).toBeCalled();
        jest.spyOn(mockSession.sessionDescriptionHandler.peerConnection, 'iceConnectionState', 'get').mockReturnValue('connected');
        mockSession.sessionDescriptionHandler.peerConnection.emit('iceconnectionstatechange', null);
        expect(mockOnMediaConnectionStateChange).toBeCalledWith('mediaConnectionStateConnected', mockSession);
        expect(mediaConnectionStateConnected).toBeCalled();
        jest.spyOn(mockSession.sessionDescriptionHandler.peerConnection, 'iceConnectionState', 'get').mockReturnValue('completed');
        mockSession.sessionDescriptionHandler.peerConnection.emit('iceconnectionstatechange', null);
        expect(mockOnMediaConnectionStateChange).toBeCalledWith('mediaConnectionStateCompleted', mockSession);
        expect(mediaConnectionStateCompleted).toBeCalled();
        jest.spyOn(mockSession.sessionDescriptionHandler.peerConnection, 'iceConnectionState', 'get').mockReturnValue('failed');
        mockSession.sessionDescriptionHandler.peerConnection.emit('iceconnectionstatechange', null);
        expect(mockOnMediaConnectionStateChange).toBeCalledWith('mediaConnectionStateFailed', mockSession);
        expect(mediaConnectionStateFailed).toBeCalled();
        jest.spyOn(mockSession.sessionDescriptionHandler.peerConnection, 'iceConnectionState', 'get').mockReturnValue('disconnected');
        mockSession.sessionDescriptionHandler.peerConnection.emit('iceconnectionstatechange', null);
        expect(mockOnMediaConnectionStateChange).toBeCalledWith('mediaConnectionStateDisconnected', mockSession);
        expect(mediaConnectionStateDisconnected).toBeCalled();
        jest.spyOn(mockSession.sessionDescriptionHandler.peerConnection, 'iceConnectionState', 'get').mockReturnValue('closed');
        mockSession.sessionDescriptionHandler.peerConnection.emit('iceconnectionstatechange', null);
        expect(mockOnMediaConnectionStateChange).toBeCalledWith('mediaConnectionStateClosed', mockSession);
        expect(mediaConnectionStateClosed).toBeCalled();
    });
    test('should not emit event on session and trigger onMediaConnectionStateChange on iceconnectionstatechange for unknown events', function () {
        var mockSession = new MockSession();
        var mediaStreamsImpl = new mediaStreams_1.MediaStreamsImpl(mockSession);
        var mockOnMediaConnectionStateChange = jest.fn();
        mediaStreamsImpl.onMediaConnectionStateChange = mockOnMediaConnectionStateChange;
        var sessionEventListener = jest.fn();
        mockSession.on('mediaConnectionStateNew', sessionEventListener);
        mockSession.on('mediaConnectionStateChecking', sessionEventListener);
        mockSession.on('mediaConnectionStateConnected', sessionEventListener);
        mockSession.on('mediaConnectionStateCompleted', sessionEventListener);
        mockSession.on('mediaConnectionStateFailed', sessionEventListener);
        mockSession.on('mediaConnectionStateDisconnected', sessionEventListener);
        mockSession.on('mediaConnectionStateClosed', sessionEventListener);
        jest.spyOn(mockSession.sessionDescriptionHandler.peerConnection, 'iceConnectionState', 'get').mockReturnValue('randomEvent');
        mockSession.sessionDescriptionHandler.peerConnection.emit('iceconnectionstatechange', null);
        expect(mockOnMediaConnectionStateChange).toBeCalledTimes(0);
        expect(sessionEventListener).toBeCalledTimes(0);
        jest.spyOn(mockSession.sessionDescriptionHandler.peerConnection, 'iceConnectionState', 'get').mockReturnValue('kylo-ren-event');
        mockSession.sessionDescriptionHandler.peerConnection.emit('iceconnectionstatechange', null);
        expect(mockOnMediaConnectionStateChange).toBeCalledTimes(0);
        expect(sessionEventListener).toBeCalledTimes(0);
    });
});
describe('MediaStreams', function () {
    afterEach(function () {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });
    test('should send reinvite when reconnecting media', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockSession, mediaStreams, mockReinvite;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockSession = new MockSession();
                    mediaStreams = new mediaStreams_1.MediaStreamsImpl(mockSession);
                    mockReinvite = jest.fn().mockReturnValue(Promise.resolve(null));
                    mockSession.reinvite = mockReinvite;
                    return [4 /*yield*/, mediaStreams.reconnectMedia()];
                case 1:
                    _a.sent();
                    expect(mockReinvite).toBeCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should clenup on release', function (done) {
        var mockSession = new MockSession();
        var mediaStreams = new mediaStreams_1.default(mockSession);
        mediaStreams.mediaStreamsImpl['mediaStatsTimer'] = 123;
        var mockRemoveEventListener = function (event, fn) {
            expect(fn).toBe(mediaStreams.mediaStreamsImpl['onPeerConnectionStateChange']);
            expect(mediaStreams.mediaStreamsImpl['mediaStatsTimer']).toBe(null);
            done();
        };
        mockSession.sessionDescriptionHandler.peerConnection.removeEventListener = mockRemoveEventListener;
        mediaStreams.release();
    });
    test('getMediaStats should be called and rtpStat event should be emitted continiously as per the interval', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockSession, mediaStreams, getStatsCallback, rtpStatCallback;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jest.useFakeTimers();
                    mockSession = new MockSession();
                    mediaStreams = new mediaStreams_1.default(mockSession);
                    getStatsCallback = jest.fn();
                    rtpStatCallback = jest.fn();
                    jest.spyOn(mockSession.sessionDescriptionHandler.peerConnection, 'iceConnectionState', 'get').mockReturnValue('connected');
                    mockSession.on(events_2.Events.Session.RTPStat, rtpStatCallback);
                    mediaStreams.getMediaStats(getStatsCallback, 100);
                    jest.advanceTimersByTime(400);
                    // Added promise resolve since fake timer + promise work differently
                    return [4 /*yield*/, Promise.resolve()];
                case 1:
                    // Added promise resolve since fake timer + promise work differently
                    _a.sent();
                    expect(getStatsCallback).toBeCalledTimes(4);
                    expect(rtpStatCallback).toBeCalledTimes(4);
                    return [4 /*yield*/, mediaStreams.release()];
                case 2:
                    _a.sent();
                    getStatsCallback.mockClear();
                    rtpStatCallback.mockClear();
                    mediaStreams.getMediaStats(getStatsCallback, 50);
                    jest.advanceTimersByTime(400);
                    // Added promise resolve since fake timer + promise work differently
                    return [4 /*yield*/, Promise.resolve()];
                case 3:
                    // Added promise resolve since fake timer + promise work differently
                    _a.sent();
                    expect(getStatsCallback).toBeCalledTimes(8);
                    expect(rtpStatCallback).toBeCalledTimes(8);
                    mediaStreams.release();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should stop sending stats when stopMediaStats is called', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockSession, mediaStreams, getStatsCallback;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jest.useFakeTimers();
                    mockSession = new MockSession();
                    mediaStreams = new mediaStreams_1.default(mockSession);
                    getStatsCallback = jest.fn();
                    jest.spyOn(mockSession.sessionDescriptionHandler.peerConnection, 'iceConnectionState', 'get').mockReturnValue('connected');
                    mediaStreams.getMediaStats(getStatsCallback, 100);
                    jest.advanceTimersByTime(400);
                    // Added promise resolve since fake timer + promise work differently
                    return [4 /*yield*/, Promise.resolve()];
                case 1:
                    // Added promise resolve since fake timer + promise work differently
                    _a.sent();
                    jest.advanceTimersByTime(400);
                    mediaStreams.stopMediaStats();
                    jest.advanceTimersByTime(400);
                    expect(getStatsCallback).toBeCalledTimes(4);
                    return [4 /*yield*/, mediaStreams.release()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should send media stats', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockSession, mediaStreams, _a, firstStat, firstReport, _b, secondStat, secondReport, getStatsCallback;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    jest.useFakeTimers();
                    mockSession = new MockSession();
                    mediaStreams = new mediaStreams_1.default(mockSession);
                    jest.spyOn(mockSession.sessionDescriptionHandler.peerConnection, 'iceConnectionState', 'get').mockReturnValue('connected');
                    _a = generateMockStatAndReport(), firstStat = _a.mockStat, firstReport = _a.mockReport;
                    _b = generateMockStatAndReport(), secondStat = _b.mockStat, secondReport = _b.mockReport;
                    jest.spyOn(mockSession.sessionDescriptionHandler.peerConnection, 'getStats')
                        .mockReturnValueOnce(Promise.resolve(firstStat))
                        .mockReturnValueOnce(Promise.resolve(secondStat));
                    getStatsCallback = jest.fn();
                    mediaStreams.getMediaStats(getStatsCallback, 100);
                    jest.advanceTimersByTime(200);
                    // Added promise resolve since fake timer + promise work differently
                    return [4 /*yield*/, Promise.resolve()];
                case 1:
                    // Added promise resolve since fake timer + promise work differently
                    _c.sent();
                    expect(getStatsCallback).toHaveBeenNthCalledWith(1, firstReport, mockSession);
                    expect(getStatsCallback).toHaveBeenNthCalledWith(2, secondReport, mockSession);
                    return [4 /*yield*/, mediaStreams.release()];
                case 2:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=mediaStreams.test.js.map