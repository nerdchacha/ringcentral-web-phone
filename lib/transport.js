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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebPhoneTransport = void 0;
var events_1 = require("events");
var sip_js_1 = require("sip.js");
var events_2 = require("./events");
function createWebPhoneTransport(transport, options) {
    transport.reconnectionAttempts = 0;
    transport.servers = options.transportServers;
    var eventEmitter = new events_1.EventEmitter();
    transport.on = eventEmitter.on.bind(eventEmitter);
    transport.off = eventEmitter.off.bind(eventEmitter);
    transport.addListener = eventEmitter.addListener.bind(eventEmitter);
    transport.removeListener = eventEmitter.removeListener.bind(eventEmitter);
    transport.emit = eventEmitter.emit.bind(eventEmitter);
    transport.mainProxy = options.transportServers[0];
    transport.switchBackInterval = options.switchBackInterval;
    transport.reconnectionTimeout = options.reconnectionTimeout;
    transport.maxReconnectionAttempts = options.maxReconnectionAttempts;
    transport.__afterWSConnected = __afterWSConnected.bind(transport);
    transport.__clearSwitchBackToMainProxyTimer = __clearSwitchBackToMainProxyTimer.bind(transport);
    transport.__computeRandomTimeout = __computeRandomTimeout.bind(transport);
    transport.__connect = transport.connect;
    transport.__isCurrentMainProxy = __isCurrentMainProxy.bind(transport);
    transport.__onConnectedToBackup = __onConnectedToBackup.bind(transport);
    transport.__onConnectedToMain = __onConnectedToMain.bind(transport);
    transport.__resetServersErrorStatus = __resetServersErrorStatus.bind(transport);
    transport.__scheduleSwitchBackToMainProxy = __scheduleSwitchBackToMainProxy.bind(transport);
    transport.__setServerIsError = __setServerIsError.bind(transport);
    transport.connect = __connect.bind(transport);
    transport.getNextWsServer = getNextWsServer.bind(transport);
    transport.isSipErrorCode = isSipErrorCode.bind(transport);
    transport.noAvailableServers = noAvailableServers.bind(transport);
    transport.onSipErrorCode = onSipErrorCode.bind(transport);
    transport.reconnect = reconnect.bind(transport);
    transport.stateChange.addListener(function (newState) {
        switch (newState) {
            case sip_js_1.TransportState.Connecting: {
                transport.emit(events_2.Events.Transport.Connecting);
                break;
            }
            case sip_js_1.TransportState.Connected: {
                transport.emit(events_2.Events.Transport.Connected);
                transport.__afterWSConnected();
                break;
            }
            case sip_js_1.TransportState.Disconnecting: {
                transport.emit(events_2.Events.Transport.Disconnecting);
                break;
            }
            case sip_js_1.TransportState.Disconnected: {
                transport.emit(events_2.Events.Transport.Disconnected);
                break;
            }
        }
    });
    return transport;
}
exports.createWebPhoneTransport = createWebPhoneTransport;
function __connect() {
    var _this = this;
    return this.__connect().catch(function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    this.logger.error("unable to establish connection to server ".concat(this.server, " - ").concat(e.message));
                    this.emit(events_2.Events.Transport.ConnectionAttemptFailure, e); // Can we move to onTransportDisconnect?
                    return [4 /*yield*/, this.reconnect()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
}
function __computeRandomTimeout(reconnectionAttempts, randomMinInterval, randomMaxInterval) {
    if (reconnectionAttempts === void 0) { reconnectionAttempts = 1; }
    if (randomMinInterval === void 0) { randomMinInterval = 0; }
    if (randomMaxInterval === void 0) { randomMaxInterval = 0; }
    if (randomMinInterval < 0 || randomMaxInterval < 0 || reconnectionAttempts < 1) {
        throw new Error('Arguments must be positive numbers');
    }
    var randomInterval = Math.floor(Math.random() * Math.abs(randomMaxInterval - randomMinInterval)) + randomMinInterval;
    var retryOffset = ((reconnectionAttempts - 1) * (randomMinInterval + randomMaxInterval)) / 2;
    return randomInterval + retryOffset;
}
function __setServerIsError(uri) {
    this.servers.forEach(function (server) {
        if (server.uri === uri && !server.isError) {
            server.isError = true;
        }
    });
}
function __resetServersErrorStatus() {
    this.servers.forEach(function (server) {
        server.isError = false;
    });
}
function __isCurrentMainProxy() {
    return this.server === this.servers[0].uri;
}
function __afterWSConnected() {
    this.__isCurrentMainProxy() ? this.__onConnectedToMain() : this.__onConnectedToBackup();
}
function __onConnectedToMain() {
    this.__clearSwitchBackToMainProxyTimer();
}
function __onConnectedToBackup() {
    if (!this.switchBackToMainProxyTimer) {
        this.__scheduleSwitchBackToMainProxy();
    }
}
function __scheduleSwitchBackToMainProxy() {
    var _this = this;
    var randomInterval = 15 * 60 * 1000; //15 min
    var switchBackInterval = this.switchBackInterval ? this.switchBackInterval * 1000 : null;
    // Add random time to expand clients connections in time;
    if (switchBackInterval) {
        switchBackInterval += this.__computeRandomTimeout(1, 0, randomInterval);
        this.logger.warn('Try to switch back to main proxy after ' + Math.round(switchBackInterval / 1000 / 60) + ' min');
        this.switchBackToMainProxyTimer = setTimeout(function () {
            _this.switchBackToMainProxyTimer = null;
            _this.logger.warn('switchBack initiated');
            _this.emit(events_2.Events.Transport.SwitchBackToMainProxy);
            //FIXME: Why is force reconnect not called here and the client is made to do that?
        }, switchBackInterval);
    }
    else {
        this.logger.warn('switchBackInterval is not set. Will be switched with next provision update ');
    }
}
function __clearSwitchBackToMainProxyTimer() {
    if (this.switchBackToMainProxyTimer) {
        clearTimeout(this.switchBackToMainProxyTimer);
        this.switchBackToMainProxyTimer = null;
    }
}
function reconnect(forceReconnectToMain) {
    return __awaiter(this, void 0, void 0, function () {
        var nextServer, randomMinInterval, randomMaxInterval;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (this.reconnectionAttempts > 0) {
                        this.logger.warn("Reconnection attempt ".concat(this.reconnectionAttempts, " failed"));
                    }
                    if (this.reconnectTimer) {
                        this.logger.warn('already trying to reconnect');
                        return [2 /*return*/];
                    }
                    if (!forceReconnectToMain) return [3 /*break*/, 3];
                    this.logger.warn('forcing connect to main WS server');
                    return [4 /*yield*/, this.disconnect()];
                case 1:
                    _a.sent();
                    this.server = this.getNextWsServer(true).uri;
                    this.reconnectionAttempts = 0;
                    return [4 /*yield*/, this.connect()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
                case 3:
                    if (!this.isConnected()) return [3 /*break*/, 6];
                    this.logger.warn('attempted to reconnect while connected - forcing disconnect');
                    return [4 /*yield*/, this.disconnect()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, this.reconnect()];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
                case 6:
                    if (this.noAvailableServers()) {
                        this.logger.warn('no available WebSocket servers left');
                        this.emit(events_2.Events.Transport.Closed);
                        this.__resetServersErrorStatus();
                        this.server = this.getNextWsServer(true).uri;
                        this.__clearSwitchBackToMainProxyTimer();
                        return [2 /*return*/];
                    }
                    this.reconnectionAttempts += 1;
                    if (!(this.reconnectionAttempts > this.maxReconnectionAttempts)) return [3 /*break*/, 8];
                    this.logger.warn("maximum reconnection attempts for WebSocket ".concat(this.server));
                    this.logger.warn("transport ".concat(this.server, " failed"));
                    this.__setServerIsError(this.server);
                    this.emit(events_2.Events.Transport.ConnectionFailure);
                    nextServer = this.getNextWsServer();
                    if (!nextServer) {
                        // No more servers available to try connecting to
                        this.logger.error('unable to connect to any transport');
                        return [2 /*return*/];
                    }
                    this.configuration.server = nextServer.uri;
                    this.reconnectionAttempts = 0;
                    return [4 /*yield*/, this.connect()];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 8:
                    randomMinInterval = (this.reconnectionTimeout - 2) * 1000;
                    randomMaxInterval = (this.reconnectionTimeout + 2) * 1000;
                    this.nextReconnectInterval = this.__computeRandomTimeout(this.reconnectionAttempts, randomMinInterval, randomMaxInterval);
                    this.logger.warn("trying to reconnect to WebSocket ".concat(this.server, " (reconnection attempt: ").concat(this.reconnectionAttempts, ")"));
                    this.reconnectTimer = setTimeout(function () {
                        _this.reconnectTimer = undefined;
                        _this.connect().then(function () {
                            _this.reconnectionAttempts = 0;
                        });
                    }, this.nextReconnectInterval);
                    this.logger.warn("next reconnection attempt in: ".concat(Math.round(this.nextReconnectInterval / 1000), " seconds."));
                    _a.label = 9;
                case 9: return [2 /*return*/];
            }
        });
    });
}
function getNextWsServer(force) {
    if (force === void 0) { force = false; }
    // Adding the force check because otherwise it will not bypass error check
    if (!force && this.noAvailableServers()) {
        this.logger.warn('attempted to get next ws server but there are no available ws servers left');
        return;
    }
    var candidates = force ? this.servers : this.servers.filter(function (_a) {
        var isError = _a.isError;
        return !isError;
    });
    return candidates[0];
}
function noAvailableServers() {
    return this.servers.every(function (_a) {
        var isError = _a.isError;
        return isError;
    });
}
function isSipErrorCode(statusCode) {
    if (!statusCode) {
        return false;
    }
    return (statusCode && this.sipErrorCodes && this.sipErrorCodes.length && this.sipErrorCodes.includes("".concat(statusCode)));
}
function onSipErrorCode() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            this.logger.warn('Error received from the server. Disconnecting from the proxy');
            this.__setServerIsError(this.server);
            this.emit(events_2.Events.Transport.ConnectionFailure);
            this.reconnectionAttempts = 0;
            return [2 /*return*/, this.reconnect()];
        });
    });
}
//# sourceMappingURL=transport.js.map