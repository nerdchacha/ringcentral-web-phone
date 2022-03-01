import { EventEmitter } from 'events';
import { Exception, Logger } from 'sip.js/lib/core';
import { Transport } from 'sip.js/lib/api/transport';
import { Transport as WebTransport } from 'sip.js/lib/platform/web/transport';
import { TransportOptions } from 'sip.js/lib/platform/web/transport/transport-options';
import { TransportState } from 'sip.js';

import { TransportServer, WebPhoneOptions } from './index';
import { Events } from './events';

export interface WebPhoneTransport extends Transport {
    configuration?: TransportOptions;
    logger?: Logger;
    mainProxy?: TransportServer;
    maxReconnectionAttempts?: number;
    nextReconnectInterval?: number;
    reconnectionAttempts?: number;
    reconnectionTimeout?: number;
    reconnectTimer?: any;
    server?: string;
    servers?: TransportServer[];
    sipErrorCodes?: string[];
    switchBackInterval?: number;
    switchBackToMainProxyTimer?: any;
    __afterWSConnected?: typeof __afterWSConnected;
    __clearSwitchBackToMainProxyTimer?: typeof __clearSwitchBackToMainProxyTimer;
    __computeRandomTimeout?: typeof __computeRandomTimeout;
    __connect?: typeof __connect;
    __isCurrentMainProxy?: typeof __isCurrentMainProxy;
    __onConnectedToBackup?: typeof __onConnectedToBackup;
    __onConnectedToMain?: typeof __onConnectedToMain;
    __resetServersErrorStatus?: typeof __resetServersErrorStatus;
    __scheduleSwitchBackToMainProxy?: typeof __scheduleSwitchBackToMainProxy;
    __setServerIsError?: typeof __setServerIsError;
    addListener?: typeof EventEmitter.prototype.addListener;
    emit?: typeof EventEmitter.prototype.emit;
    getNextWsServer?: (force?: boolean) => TransportServer;
    isSipErrorCode?: typeof isSipErrorCode;
    noAvailableServers?: () => boolean;
    off?: typeof EventEmitter.prototype.off;
    on?: typeof EventEmitter.prototype.on;
    onSipErrorCode?: typeof onSipErrorCode;
    reconnect?: typeof WebTransport.prototype.connect;
    removeListener?: typeof EventEmitter.prototype.removeListener;
}

/** @ignore */
export function createWebPhoneTransport(transport: WebPhoneTransport, options: WebPhoneOptions): WebPhoneTransport {
    transport.reconnectionAttempts = 0;
    transport.servers = options.transportServers;
    const eventEmitter = new EventEmitter();
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
    transport.stateChange.addListener((newState) => {
        switch (newState) {
            case TransportState.Connecting: {
                transport.emit(Events.Transport.Connecting);
                break;
            }
            case TransportState.Connected: {
                transport.emit(Events.Transport.Connected);
                transport.__afterWSConnected();
                break;
            }
            case TransportState.Disconnecting: {
                transport.emit(Events.Transport.Disconnecting);
                break;
            }
            case TransportState.Disconnected: {
                transport.emit(Events.Transport.Disconnected);
                break;
            }
        }
    });
    return transport;
}

function __connect(this: WebPhoneTransport): Promise<void> {
    return this.__connect().catch(async (e: Exception) => {
        this.logger.error(`unable to establish connection to server ${this.server} - ${e.message}`);
        this.emit(Events.Transport.ConnectionAttemptFailure, e); // Can we move to onTransportDisconnect?
        await this.reconnect();
    });
}

function __computeRandomTimeout(reconnectionAttempts = 1, randomMinInterval = 0, randomMaxInterval = 0): number {
    if (randomMinInterval < 0 || randomMaxInterval < 0 || reconnectionAttempts < 1) {
        throw new Error('Arguments must be positive numbers');
    }

    const randomInterval =
        Math.floor(Math.random() * Math.abs(randomMaxInterval - randomMinInterval)) + randomMinInterval;
    const retryOffset = ((reconnectionAttempts - 1) * (randomMinInterval + randomMaxInterval)) / 2;

    return randomInterval + retryOffset;
}

function __setServerIsError(this: WebPhoneTransport, uri: string): void {
    this.servers.forEach((server) => {
        if (server.uri === uri && !server.isError) {
            server.isError = true;
        }
    });
}

function __resetServersErrorStatus(this: WebPhoneTransport): void {
    this.servers.forEach((server) => {
        server.isError = false;
    });
}

function __isCurrentMainProxy(this: WebPhoneTransport): boolean {
    return this.server === this.servers[0].uri;
}

function __afterWSConnected(): void {
    this.__isCurrentMainProxy() ? this.__onConnectedToMain() : this.__onConnectedToBackup();
}

function __onConnectedToMain(this: WebPhoneTransport): void {
    this.__clearSwitchBackToMainProxyTimer();
}

function __onConnectedToBackup(this: WebPhoneTransport): void {
    if (!this.switchBackToMainProxyTimer) {
        this.__scheduleSwitchBackToMainProxy();
    }
}

function __scheduleSwitchBackToMainProxy(this: WebPhoneTransport): void {
    const randomInterval = 15 * 60 * 1000; //15 min

    let switchBackInterval = this.switchBackInterval ? this.switchBackInterval * 1000 : null;

    // Add random time to expand clients connections in time;
    if (switchBackInterval) {
        switchBackInterval += this.__computeRandomTimeout(1, 0, randomInterval);
        this.logger.warn(
            'Try to switch back to main proxy after ' + Math.round(switchBackInterval / 1000 / 60) + ' min'
        );

        this.switchBackToMainProxyTimer = setTimeout(() => {
            this.switchBackToMainProxyTimer = null;
            this.logger.warn('switchBack initiated');
            this.emit(Events.Transport.SwitchBackToMainProxy);
            //FIXME: Why is force reconnect not called here and the client is made to do that?
        }, switchBackInterval);
    } else {
        this.logger.warn('switchBackInterval is not set. Will be switched with next provision update ');
    }
}

function __clearSwitchBackToMainProxyTimer(this: WebPhoneTransport): void {
    if (this.switchBackToMainProxyTimer) {
        clearTimeout(this.switchBackToMainProxyTimer);
        this.switchBackToMainProxyTimer = null;
    }
}

async function reconnect(this: WebPhoneTransport, forceReconnectToMain?: boolean): Promise<void> {
    if (this.reconnectionAttempts > 0) {
        this.logger.warn(`Reconnection attempt ${this.reconnectionAttempts} failed`);
    }

    if (this.reconnectTimer) {
        this.logger.warn('already trying to reconnect');
        return;
    }

    if (forceReconnectToMain) {
        this.logger.warn('forcing connect to main WS server');
        await this.disconnect();
        this.server = this.getNextWsServer(true).uri;
        this.reconnectionAttempts = 0;
        await this.connect();
        return;
    }

    if (this.isConnected()) {
        this.logger.warn('attempted to reconnect while connected - forcing disconnect');
        await this.disconnect();
        await this.reconnect();
        return;
    }

    if (this.noAvailableServers()) {
        this.logger.warn('no available WebSocket servers left');
        this.emit(Events.Transport.Closed);
        this.__resetServersErrorStatus();
        this.server = this.getNextWsServer(true).uri;
        this.__clearSwitchBackToMainProxyTimer();
        return;
    }

    this.reconnectionAttempts += 1;

    if (this.reconnectionAttempts > this.maxReconnectionAttempts) {
        this.logger.warn(`maximum reconnection attempts for WebSocket ${this.server}`);
        this.logger.warn(`transport ${this.server} failed`);
        this.__setServerIsError(this.server);
        this.emit(Events.Transport.ConnectionFailure);
        const nextServer = this.getNextWsServer();
        if (!nextServer) {
            // No more servers available to try connecting to
            this.logger.error('unable to connect to any transport');
            return;
        }
        this.configuration.server = nextServer.uri;
        this.reconnectionAttempts = 0;
        await this.connect();
    } else {
        const randomMinInterval = (this.reconnectionTimeout - 2) * 1000;
        const randomMaxInterval = (this.reconnectionTimeout + 2) * 1000;
        this.nextReconnectInterval = this.__computeRandomTimeout(
            this.reconnectionAttempts,
            randomMinInterval,
            randomMaxInterval
        );
        this.logger.warn(
            `trying to reconnect to WebSocket ${this.server} (reconnection attempt: ${this.reconnectionAttempts})`
        );
        // FIXME: handle reconnectTimer on disconnect/error
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = undefined;
            this.connect().then(() => {
                this.reconnectionAttempts = 0;
            });
        }, this.nextReconnectInterval);
        this.logger.warn(`next reconnection attempt in: ${Math.round(this.nextReconnectInterval / 1000)} seconds.`);
    }
}

function getNextWsServer(this: WebPhoneTransport, force = false): TransportServer {
    // Adding the force check because otherwise it will not bypass error check
    if (!force && this.noAvailableServers()) {
        this.logger.warn('attempted to get next ws server but there are no available ws servers left');
        return;
    }
    const candidates = force ? this.servers : this.servers.filter(({ isError }) => !isError);
    return candidates[0];
}

function noAvailableServers(this: WebPhoneTransport): boolean {
    return this.servers.every(({ isError }) => isError);
}

// FIXME: This has changed. Verify
function isSipErrorCode(this: WebPhoneTransport, statusCode: number | undefined): boolean {
    if (!statusCode) {
        return false;
    }

    return (
        statusCode && this.sipErrorCodes && this.sipErrorCodes.length && this.sipErrorCodes.includes(`${statusCode}`)
    );
}

async function onSipErrorCode(this: WebPhoneTransport): Promise<void> {
    this.logger.warn('Error received from the server. Disconnecting from the proxy');
    this.__setServerIsError(this.server);
    this.emit(Events.Transport.ConnectionFailure);
    this.reconnectionAttempts = 0;
    // FIXME: reconnect handles disconnecting if already connected and gets the next server
    return this.reconnect();
}
