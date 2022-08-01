import { EventEmitter } from 'events';
import { Logger } from 'sip.js/lib/core';
import { Transport } from 'sip.js/lib/api/transport';
import { Transport as WebTransport } from 'sip.js/lib/platform/web/transport';
import { TransportOptions } from 'sip.js/lib/platform/web/transport/transport-options';
import { TransportServer, WebPhoneOptions } from './index';
export interface WebPhoneTransport extends Transport {
    /** @ignore */
    configuration?: TransportOptions;
    /** logger class to log transport related messaged */
    logger?: Logger;
    /**
     * Address of the RingCentral main proxy
     * Is calculated automatically as the first item in the `options.transportServers` array
     */
    mainProxy?: TransportServer;
    /** Max attempts until which transport reconnection will be attempted before moving to the next available `transportServer` */
    maxReconnectionAttempts?: number;
    /** Interval after which the next reconnection attempt will be made */
    nextReconnectInterval?: number;
    /** The current reconnection attempt */
    reconnectionAttempts?: number;
    /** Timeout to be used to calculate when should the next reconnection attempt be made */
    reconnectionTimeout?: number;
    /** @ignore */
    reconnectTimer?: any;
    /** Current server where transport is connected */
    server?: string;
    /** Possible list of servers where transport can connect to */
    servers?: TransportServer[];
    /** List of SIP error codes */
    sipErrorCodes?: string[];
    /** Interal after which switch back to main proxy should be initiated */
    switchBackInterval?: number;
    /** @ignore */
    switchBackToMainProxyTimer?: any;
    /** @ignore */
    __afterWSConnected?: typeof __afterWSConnected;
    /** @ignore */
    __clearSwitchBackToMainProxyTimer?: typeof __clearSwitchBackToMainProxyTimer;
    /** @ignore */
    __computeRandomTimeout?: typeof __computeRandomTimeout;
    /** @ignore */
    __connect?: typeof __connect;
    /** @ignore */
    __isCurrentMainProxy?: typeof __isCurrentMainProxy;
    /** @ignore */
    __onConnectedToBackup?: typeof __onConnectedToBackup;
    /** @ignore */
    __onConnectedToMain?: typeof __onConnectedToMain;
    /** @ignore */
    __resetServersErrorStatus?: typeof __resetServersErrorStatus;
    /** @ignore */
    __scheduleSwitchBackToMainProxy?: typeof __scheduleSwitchBackToMainProxy;
    /** @ignore */
    __setServerIsError?: typeof __setServerIsError;
    /** Register functions to be called when events are fired on the transport object */
    addListener?: typeof EventEmitter.prototype.addListener;
    /** Trigger events on transport object */
    emit?: typeof EventEmitter.prototype.emit;
    /** Get next available server from the list of `transportServers` */
    getNextWsServer?: (force?: boolean) => TransportServer;
    /** Is the current code part of the SIP error codes registered with the transport object */
    isSipErrorCode?: typeof isSipErrorCode;
    /** Helper function to check if any valid `transportServers` are available to connect to */
    noAvailableServers?: () => boolean;
    /**
     * Unregister functions to be called when events are fired on the transport object
     *
     * alias for removeListener
     */
    off?: typeof EventEmitter.prototype.off;
    /** Register functions to be called when events are fired on the transport object
     *
     * alias for addListener
     */
    on?: typeof EventEmitter.prototype.on;
    /** Register functions to be called once when events are fired on the transport object */
    once?: typeof EventEmitter.prototype.once;
    /** @ignore */
    onSipErrorCode?: typeof onSipErrorCode;
    /** Function to try reconnecting to the transport. Is automatically triggered when transport connection is dropped or `sipErrorCode` is returned from backend server*/
    reconnect?: typeof WebTransport.prototype.connect;
    /**
     * Unregister functions to be called when events are fired on the transport object
     */
    removeListener?: typeof EventEmitter.prototype.removeListener;
    /**
     * Unregister all functions to be called when events are fired on the transport object
     */
    removeAllListeners?: typeof EventEmitter.prototype.removeAllListeners;
}
export declare function createWebPhoneTransport(transport: WebPhoneTransport, options: WebPhoneOptions): WebPhoneTransport;
declare function __connect(this: WebPhoneTransport): Promise<void>;
declare function __computeRandomTimeout(reconnectionAttempts?: number, randomMinInterval?: number, randomMaxInterval?: number): number;
declare function __setServerIsError(this: WebPhoneTransport, uri: string): void;
declare function __resetServersErrorStatus(this: WebPhoneTransport): void;
declare function __isCurrentMainProxy(this: WebPhoneTransport): boolean;
declare function __afterWSConnected(): void;
declare function __onConnectedToMain(this: WebPhoneTransport): void;
declare function __onConnectedToBackup(this: WebPhoneTransport): void;
declare function __scheduleSwitchBackToMainProxy(this: WebPhoneTransport): void;
declare function __clearSwitchBackToMainProxyTimer(this: WebPhoneTransport): void;
declare function isSipErrorCode(this: WebPhoneTransport, statusCode: number | undefined): boolean;
declare function onSipErrorCode(this: WebPhoneTransport): Promise<void>;
export {};
