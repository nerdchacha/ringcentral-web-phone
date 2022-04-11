"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchUserAgentCore = void 0;
var events_1 = require("events");
var core_1 = require("sip.js/lib/core");
var events_2 = require("./events");
/** @ignore */
function patchUserAgentCore(userAgent) {
    var userAgentCore = userAgent.userAgentCore;
    var eventEmitter = new events_1.EventEmitter();
    userAgentCore.on = eventEmitter.on.bind(eventEmitter);
    userAgentCore.off = eventEmitter.off.bind(eventEmitter);
    userAgentCore.addListener = eventEmitter.addListener.bind(eventEmitter);
    userAgentCore.removeListener = eventEmitter.removeListener.bind(eventEmitter);
    userAgentCore.emit = eventEmitter.emit.bind(eventEmitter);
    userAgentCore._receiveIncomingRequestFromTransport = userAgentCore.receiveIncomingRequestFromTransport.bind(userAgent.userAgentCore);
    userAgentCore.receiveIncomingRequestFromTransport = receiveIncomingRequestFromTransport.bind(userAgent.userAgentCore);
}
exports.patchUserAgentCore = patchUserAgentCore;
function receiveIncomingRequestFromTransport(message) {
    var _a, _b, _c;
    switch (message.method) {
        case core_1.C.UPDATE: {
            this.logger.log('Receive UPDATE request. Do nothing just return 200 OK');
            this.replyStateless(message, { statusCode: 200 });
            this.emit(events_2.Events.Session.UpdateReceived, message);
            return;
        }
        case core_1.C.INFO: {
            // For the Move2RCV request from server
            var content = getIncomingInfoContent(message);
            if (((_a = content === null || content === void 0 ? void 0 : content.request) === null || _a === void 0 ? void 0 : _a.reqId) && ((_b = content === null || content === void 0 ? void 0 : content.request) === null || _b === void 0 ? void 0 : _b.command) === 'move' && ((_c = content === null || content === void 0 ? void 0 : content.request) === null || _c === void 0 ? void 0 : _c.target) === 'rcv') {
                this.replyStateless(message, { statusCode: 200 });
                this.emit(events_2.Events.Session.MoveToRcv, content.request);
                return;
            }
            // For other SIP INFO from server
            this.emit('RC_SIP_INFO', message);
            // SIP.js does not support application/json content type, so we monkey override its behaviour in this case
            var contentType = message.getHeader('content-type');
            if (contentType.match(/^application\/json/i)) {
                this.replyStateless(message, { statusCode: 200 });
                return;
            }
            break;
        }
    }
    return this._receiveIncomingRequestFromTransport(message);
}
function getIncomingInfoContent(message) {
    if (!message || !message.body) {
        return {};
    }
    var ret = {};
    try {
        ret = JSON.parse(message.body);
    }
    catch (e) {
        return {};
    }
    return ret;
}
//# sourceMappingURL=userAgentCore.js.map