import { EventEmitter } from 'events';
import { UserAgentCore } from 'sip.js/lib/core';
import { WebPhoneUserAgent } from './userAgent';
export declare type WehPhoneUserAgentCore = UserAgentCore & {
    _receiveIncomingRequestFromTransport?: typeof UserAgentCore.prototype.receiveIncomingRequestFromTransport;
    addListener?: typeof EventEmitter.prototype.addListener;
    emit?: typeof EventEmitter.prototype.emit;
    off?: typeof EventEmitter.prototype.off;
    on?: typeof EventEmitter.prototype.on;
    removeListener?: typeof EventEmitter.prototype.removeListener;
};
/** @ignore */
export declare function patchUserAgentCore(userAgent: WebPhoneUserAgent): void;
