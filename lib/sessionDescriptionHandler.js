"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSessionDescriptionFactory = exports.defaultMediaStreamFactory = exports.defaultPeerConnectionConfiguration = exports.SessionDescriptionHandler = void 0;
/**
 * A base class implementing a WebRTC session description handler for sip.js.
 * @remarks
 * It is expected/intended to be extended by specific WebRTC based applications.
 * @privateRemarks
 * So do not put application specific implementation in here.
 * @public
 */
var SessionDescriptionHandler = /** @class */ (function () {
    /**
     * Constructor
     * @param logger - A logger
     * @param mediaStreamFactory - A factory to provide a MediaStream
     * @param options - Options passed from the SessionDescriptionHandleFactory
     */
    function SessionDescriptionHandler(logger, mediaStreamFactory, sessionDescriptionHandlerConfiguration) {
        logger.debug('SessionDescriptionHandler.constructor');
        this.logger = logger;
        this.mediaStreamFactory = mediaStreamFactory;
        this.sessionDescriptionHandlerConfiguration = sessionDescriptionHandlerConfiguration;
        this._localMediaStream = new MediaStream();
        this._remoteMediaStream = new MediaStream();
        this._peerConnection = new RTCPeerConnection(sessionDescriptionHandlerConfiguration === null || sessionDescriptionHandlerConfiguration === void 0 ? void 0 : sessionDescriptionHandlerConfiguration.peerConnectionConfiguration);
        this.initPeerConnectionEventHandlers();
    }
    Object.defineProperty(SessionDescriptionHandler.prototype, "localMediaStream", {
        /**
         * The local media stream currently being sent.
         *
         * @remarks
         * The local media stream initially has no tracks, so the presence of tracks
         * should not be assumed. Furthermore, tracks may be added or removed if the
         * local media changes - for example, on upgrade from audio only to a video session.
         * At any given time there will be at most one audio track and one video track
         * (it's possible that this restriction may not apply to sub-classes).
         * Use `MediaStream.onaddtrack` or add a listener for the `addtrack` event
         * to detect when a new track becomes available:
         * https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/onaddtrack
         */
        get: function () {
            return this._localMediaStream;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SessionDescriptionHandler.prototype, "remoteMediaStream", {
        /**
         * The remote media stream currently being received.
         *
         * @remarks
         * The remote media stream initially has no tracks, so the presence of tracks
         * should not be assumed. Furthermore, tracks may be added or removed if the
         * remote media changes - for example, on upgrade from audio only to a video session.
         * At any given time there will be at most one audio track and one video track
         * (it's possible that this restriction may not apply to sub-classes).
         * Use `MediaStream.onaddtrack` or add a listener for the `addtrack` event
         * to detect when a new track becomes available:
         * https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/onaddtrack
         */
        get: function () {
            return this._remoteMediaStream;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SessionDescriptionHandler.prototype, "dataChannel", {
        /**
         * The data channel. Undefined before it is created.
         */
        get: function () {
            return this._dataChannel;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SessionDescriptionHandler.prototype, "peerConnection", {
        /**
         * The peer connection. Undefined if peer connection has closed.
         *
         * @remarks
         * While access to the underlying `RTCPeerConnection` is provided, note that
         * using methods with modify it may break the operation of this class.
         * In particular, this class depends on exclusive access to the
         * event handler properties. If you need access to the peer connection
         * events, either register for events using `addEventListener()` on
         * the `RTCPeerConnection` or set the `peerConnectionDelegate` on
         * this `SessionDescriptionHandler`.
         */
        get: function () {
            return this._peerConnection;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SessionDescriptionHandler.prototype, "peerConnectionDelegate", {
        /**
         * A delegate which provides access to the peer connection event handlers.
         *
         * @remarks
         * Setting the peer connection event handlers directly is not supported
         * and may break this class. As this class depends on exclusive access
         * to them, a delegate may be set which provides alternative access to
         * the event handlers in a fashion which is supported.
         */
        get: function () {
            return this._peerConnectionDelegate;
        },
        set: function (delegate) {
            this._peerConnectionDelegate = delegate;
        },
        enumerable: false,
        configurable: true
    });
    // The addtrack event does not get fired when JavaScript code explicitly adds tracks to the stream (by calling addTrack()).
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/onaddtrack
    SessionDescriptionHandler.dispatchAddTrackEvent = function (stream, track) {
        stream.dispatchEvent(new MediaStreamTrackEvent('addtrack', { track: track }));
    };
    // The removetrack event does not get fired when JavaScript code explicitly removes tracks from the stream (by calling removeTrack()).
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/onremovetrack
    SessionDescriptionHandler.dispatchRemoveTrackEvent = function (stream, track) {
        stream.dispatchEvent(new MediaStreamTrackEvent('removetrack', { track: track }));
    };
    /**
     * Stop tracks and close peer connection.
     */
    SessionDescriptionHandler.prototype.close = function () {
        this.logger.debug('SessionDescriptionHandler.close');
        if (this._peerConnection === undefined) {
            return;
        }
        this._peerConnection.getReceivers().forEach(function (receiver) {
            receiver.track && receiver.track.stop();
        });
        this._peerConnection.getSenders().forEach(function (sender) {
            sender.track && sender.track.stop();
        });
        if (this._dataChannel) {
            this._dataChannel.close();
        }
        this._peerConnection.close();
        this._peerConnection = undefined;
    };
    /**
     * Creates an offer or answer.
     * @param options - Options bucket.
     * @param modifiers - Modifiers.
     */
    SessionDescriptionHandler.prototype.getDescription = function (options, modifiers) {
        var _this = this;
        var _a, _b;
        this.logger.debug('SessionDescriptionHandler.getDescription');
        if (this._peerConnection === undefined) {
            return Promise.reject(new Error('Peer connection closed.'));
        }
        // Callback on data channel creation
        this.onDataChannel = options === null || options === void 0 ? void 0 : options.onDataChannel;
        // ICE will restart upon applying an offer created with the iceRestart option
        var iceRestart = (_a = options === null || options === void 0 ? void 0 : options.offerOptions) === null || _a === void 0 ? void 0 : _a.iceRestart;
        // ICE gathering timeout may be set on a per call basis, otherwise the configured default is used
        var iceTimeout = (options === null || options === void 0 ? void 0 : options.iceGatheringTimeout) === undefined
            ? (_b = this.sessionDescriptionHandlerConfiguration) === null || _b === void 0 ? void 0 : _b.iceGatheringTimeout
            : options === null || options === void 0 ? void 0 : options.iceGatheringTimeout;
        return this.getLocalMediaStream(options)
            .then(function () { return _this.enableSenderDscp(); })
            .then(function () { return _this.updateDirection(options); })
            .then(function () { return _this.createDataChannel(options); })
            .then(function () { return _this.createLocalOfferOrAnswer(options); })
            .then(function (sessionDescription) { return _this.applyModifiers(sessionDescription, modifiers); })
            .then(function (sessionDescription) { return _this.setLocalSessionDescription(sessionDescription); })
            .then(function () { return _this.waitForIceGatheringComplete(iceRestart, iceTimeout); })
            .then(function () { return _this.getLocalSessionDescription(); })
            .then(function (sessionDescription) {
            return {
                body: sessionDescription.sdp,
                contentType: 'application/sdp'
            };
        })
            .catch(function (error) {
            _this.logger.error('SessionDescriptionHandler.getDescription failed - ' + error);
            throw error;
        });
    };
    /**
     * Returns true if the SessionDescriptionHandler can handle the Content-Type described by a SIP message.
     * @param contentType - The content type that is in the SIP Message.
     */
    SessionDescriptionHandler.prototype.hasDescription = function (contentType) {
        this.logger.debug('SessionDescriptionHandler.hasDescription');
        return contentType === 'application/sdp';
    };
    /**
     * Send DTMF via RTP (RFC 4733).
     * Returns true if DTMF send is successful, false otherwise.
     * @param tones - A string containing DTMF digits.
     * @param options - Options object to be used by sendDtmf.
     */
    SessionDescriptionHandler.prototype.sendDtmf = function (tones, options) {
        this.logger.debug('SessionDescriptionHandler.sendDtmf');
        if (this._peerConnection === undefined) {
            this.logger.error('SessionDescriptionHandler.sendDtmf failed - peer connection closed');
            return false;
        }
        var senders = this._peerConnection.getSenders();
        if (senders.length === 0) {
            this.logger.error('SessionDescriptionHandler.sendDtmf failed - no senders');
            return false;
        }
        var dtmfSender = senders[0].dtmf;
        if (!dtmfSender) {
            this.logger.error('SessionDescriptionHandler.sendDtmf failed - no DTMF sender');
            return false;
        }
        var duration = options === null || options === void 0 ? void 0 : options.duration;
        var interToneGap = options === null || options === void 0 ? void 0 : options.interToneGap;
        try {
            dtmfSender.insertDTMF(tones, duration, interToneGap);
        }
        catch (e) {
            this.logger.error(e);
            return false;
        }
        this.logger.log('SessionDescriptionHandler.sendDtmf sent via RTP: ' + tones.toString());
        return true;
    };
    /**
     * Sets an offer or answer.
     * @param sdp - The session description.
     * @param options - Options bucket.
     * @param modifiers - Modifiers.
     */
    SessionDescriptionHandler.prototype.setDescription = function (sdp, options, modifiers) {
        var _this = this;
        this.logger.debug('SessionDescriptionHandler.setDescription');
        if (this._peerConnection === undefined) {
            return Promise.reject(new Error('Peer connection closed.'));
        }
        // Callback on data channel creation
        this.onDataChannel = options === null || options === void 0 ? void 0 : options.onDataChannel;
        // SDP type
        var type = this._peerConnection.signalingState === 'have-local-offer' ? 'answer' : 'offer';
        return this.getLocalMediaStream(options)
            .then(function () { return _this.applyModifiers({ sdp: sdp, type: type }, modifiers); })
            .then(function (sessionDescription) { return _this.setRemoteSessionDescription(sessionDescription); })
            .catch(function (error) {
            _this.logger.error('SessionDescriptionHandler.setDescription failed - ' + error);
            throw error;
        });
    };
    /**
     * Applies modifiers to SDP prior to setting the local or remote description.
     * @param sdp - SDP to modify.
     * @param modifiers - Modifiers to apply.
     */
    SessionDescriptionHandler.prototype.applyModifiers = function (sdp, modifiers) {
        var _this = this;
        this.logger.debug('SessionDescriptionHandler.applyModifiers');
        if (!modifiers || modifiers.length === 0) {
            return Promise.resolve(sdp);
        }
        return modifiers
            .reduce(function (cur, next) { return cur.then(next); }, Promise.resolve(sdp))
            .then(function (modified) {
            _this.logger.debug('SessionDescriptionHandler.applyModifiers - modified sdp');
            if (!modified.sdp || !modified.type) {
                throw new Error('Invalid SDP.');
            }
            return { sdp: modified.sdp, type: modified.type };
        });
    };
    /**
     * Create a data channel.
     * @remarks
     * Only creates a data channel if SessionDescriptionHandlerOptions.dataChannel is true.
     * Only creates a data channel if creating a local offer.
     * Only if one does not already exist.
     * @param options - Session description handler options.
     */
    SessionDescriptionHandler.prototype.createDataChannel = function (options) {
        if (this._peerConnection === undefined) {
            return Promise.reject(new Error('Peer connection closed.'));
        }
        // only create a data channel if requested
        if ((options === null || options === void 0 ? void 0 : options.dataChannel) !== true) {
            return Promise.resolve();
        }
        // do not create a data channel if we already have one
        if (this._dataChannel) {
            return Promise.resolve();
        }
        switch (this._peerConnection.signalingState) {
            case 'stable':
                // if we are stable, assume we are creating a local offer so create a data channel
                this.logger.debug('SessionDescriptionHandler.createDataChannel - creating data channel');
                try {
                    this._dataChannel = this._peerConnection.createDataChannel((options === null || options === void 0 ? void 0 : options.dataChannelLabel) || '', options === null || options === void 0 ? void 0 : options.dataChannelOptions);
                    if (this.onDataChannel) {
                        this.onDataChannel(this._dataChannel);
                    }
                    return Promise.resolve();
                }
                catch (error) {
                    return Promise.reject(error);
                }
            case 'have-remote-offer':
                return Promise.resolve();
            case 'have-local-offer':
            case 'have-local-pranswer':
            case 'have-remote-pranswer':
            case 'closed':
            default:
                return Promise.reject(new Error('Invalid signaling state ' + this._peerConnection.signalingState));
        }
    };
    /**
     * Depending on current signaling state, create a local offer or answer.
     * @param options - Session description handler options.
     */
    SessionDescriptionHandler.prototype.createLocalOfferOrAnswer = function (options) {
        if (this._peerConnection === undefined) {
            return Promise.reject(new Error('Peer connection closed.'));
        }
        switch (this._peerConnection.signalingState) {
            case 'stable':
                // if we are stable, assume we are creating a local offer
                this.logger.debug('SessionDescriptionHandler.createLocalOfferOrAnswer - creating SDP offer');
                return this._peerConnection.createOffer(options === null || options === void 0 ? void 0 : options.offerOptions);
            case 'have-remote-offer':
                // if we have a remote offer, assume we are creating a local answer
                this.logger.debug('SessionDescriptionHandler.createLocalOfferOrAnswer - creating SDP answer');
                return this._peerConnection.createAnswer(options === null || options === void 0 ? void 0 : options.answerOptions);
            case 'have-local-offer':
            case 'have-local-pranswer':
            case 'have-remote-pranswer':
            case 'closed':
            default:
                return Promise.reject(new Error('Invalid signaling state ' + this._peerConnection.signalingState));
        }
    };
    /**
     * Get a media stream from the media stream factory and set the local media stream.
     * @param options - Session description handler options.
     */
    SessionDescriptionHandler.prototype.getLocalMediaStream = function (options) {
        var _this = this;
        this.logger.debug('SessionDescriptionHandler.getLocalMediaStream');
        if (this._peerConnection === undefined) {
            return Promise.reject(new Error('Peer connection closed.'));
        }
        var constraints = __assign({}, options === null || options === void 0 ? void 0 : options.constraints);
        // if we already have a local media stream...
        if (this.localMediaStreamConstraints) {
            // ignore constraint "downgrades"
            constraints.audio = constraints.audio || this.localMediaStreamConstraints.audio;
            constraints.video = constraints.video || this.localMediaStreamConstraints.video;
            // if constraints have not changed, do not get a new media stream
            if (JSON.stringify(this.localMediaStreamConstraints.audio) === JSON.stringify(constraints.audio) &&
                JSON.stringify(this.localMediaStreamConstraints.video) === JSON.stringify(constraints.video)) {
                return Promise.resolve();
            }
        }
        else {
            // if no constraints have been specified, default to audio for initial media stream
            if (constraints.audio === undefined && constraints.video === undefined) {
                constraints = { audio: true };
            }
        }
        this.localMediaStreamConstraints = constraints;
        return this.mediaStreamFactory(constraints, this).then(function (mediaStream) {
            return _this.setLocalMediaStream(mediaStream);
        });
    };
    /**
     * Sets the encoding priorty to high for sender track.
     *
     */
    SessionDescriptionHandler.prototype.enableSenderDscp = function () {
        if (!this.sessionDescriptionHandlerConfiguration.enableDscp) {
            return Promise.resolve();
        }
        if (!this._peerConnection) {
            throw new Error('Peer connection undefined.');
        }
        var pc = this._peerConnection;
        pc.getSenders()
            .filter(function (sender) { return sender.track; })
            .forEach(function (sender) {
            var parameters = sender.getParameters();
            console.info('getsender params =', parameters);
            parameters.priority = 'high';
            sender.setParameters(parameters).catch(function (error) {
                console.error("Error while setting encodings parameters for ".concat(sender.track.kind, " Track ").concat(sender.track.id, ": ").concat(error.message || error.name));
            });
        });
    };
    /**
     * Sets the peer connection's sender tracks and local media stream tracks.
     *
     * @remarks
     * Only the first audio and video tracks of the provided MediaStream are utilized.
     * Adds tracks if audio and/or video tracks are not already present, otherwise replaces tracks.
     *
     * @param stream - Media stream containing tracks to be utilized.
     */
    SessionDescriptionHandler.prototype.setLocalMediaStream = function (stream) {
        var _this = this;
        this.logger.debug('SessionDescriptionHandler.setLocalMediaStream');
        if (!this._peerConnection) {
            throw new Error('Peer connection undefined.');
        }
        var pc = this._peerConnection;
        var localStream = this._localMediaStream;
        var trackUpdates = [];
        var updateTrack = function (newTrack) {
            var kind = newTrack.kind;
            if (kind !== 'audio' && kind !== 'video') {
                throw new Error("Unknown new track kind ".concat(kind, "."));
            }
            var s = pc.getSenders();
            var sender = pc.getSenders().find(function (sender) { return sender.track && sender.track.kind === kind; });
            if (sender) {
                trackUpdates.push(new Promise(function (resolve) {
                    _this.logger.debug("SessionDescriptionHandler.setLocalMediaStream - replacing sender ".concat(kind, " track"));
                    resolve();
                }).then(function () {
                    return sender
                        .replaceTrack(newTrack)
                        .then(function () {
                        var oldTrack = localStream.getTracks().find(function (localTrack) { return localTrack.kind === kind; });
                        if (oldTrack) {
                            oldTrack.stop();
                            localStream.removeTrack(oldTrack);
                            SessionDescriptionHandler.dispatchRemoveTrackEvent(localStream, oldTrack);
                        }
                        localStream.addTrack(newTrack);
                        SessionDescriptionHandler.dispatchAddTrackEvent(localStream, newTrack);
                    })
                        .catch(function (error) {
                        _this.logger.error("SessionDescriptionHandler.setLocalMediaStream - failed to replace sender ".concat(kind, " track"));
                        throw error;
                    });
                }));
            }
            else {
                trackUpdates.push(new Promise(function (resolve) {
                    _this.logger.debug("SessionDescriptionHandler.setLocalMediaStream - adding sender ".concat(kind, " track"));
                    resolve();
                }).then(function () {
                    // Review: could make streamless tracks a configurable option?
                    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addTrack#Usage_notes
                    try {
                        pc.addTrack(newTrack, localStream);
                    }
                    catch (error) {
                        _this.logger.error("SessionDescriptionHandler.setLocalMediaStream - failed to add sender ".concat(kind, " track"));
                        throw error;
                    }
                    localStream.addTrack(newTrack);
                    SessionDescriptionHandler.dispatchAddTrackEvent(localStream, newTrack);
                }));
            }
        };
        // update peer connection audio tracks
        var audioTracks = stream.getAudioTracks();
        if (audioTracks.length) {
            updateTrack(audioTracks[0]);
        }
        // update peer connection video tracks
        var videoTracks = stream.getVideoTracks();
        if (videoTracks.length) {
            updateTrack(videoTracks[0]);
        }
        return trackUpdates.reduce(function (p, x) { return p.then(function () { return x; }); }, Promise.resolve());
    };
    /**
     * Gets the peer connection's local session description.
     */
    SessionDescriptionHandler.prototype.getLocalSessionDescription = function () {
        this.logger.debug('SessionDescriptionHandler.getLocalSessionDescription');
        if (this._peerConnection === undefined) {
            return Promise.reject(new Error('Peer connection closed.'));
        }
        var sdp = this._peerConnection.localDescription;
        if (!sdp) {
            return Promise.reject(new Error('Failed to get local session description'));
        }
        return Promise.resolve(sdp);
    };
    /**
     * Sets the peer connection's local session description.
     * @param sessionDescription - sessionDescription The session description.
     */
    SessionDescriptionHandler.prototype.setLocalSessionDescription = function (sessionDescription) {
        this.logger.debug('SessionDescriptionHandler.setLocalSessionDescription');
        if (this._peerConnection === undefined) {
            return Promise.reject(new Error('Peer connection closed.'));
        }
        return this._peerConnection.setLocalDescription(sessionDescription);
    };
    /**
     * Sets the peer connection's remote session description.
     * @param sessionDescription - The session description.
     */
    SessionDescriptionHandler.prototype.setRemoteSessionDescription = function (sessionDescription) {
        this.logger.debug('SessionDescriptionHandler.setRemoteSessionDescription');
        if (this._peerConnection === undefined) {
            return Promise.reject(new Error('Peer connection closed.'));
        }
        var sdp = sessionDescription.sdp;
        var type;
        switch (this._peerConnection.signalingState) {
            case 'stable':
                // if we are stable assume this is a remote offer
                type = 'offer';
                break;
            case 'have-local-offer':
                // if we made an offer, assume this is a remote answer
                type = 'answer';
                break;
            case 'have-local-pranswer':
            case 'have-remote-offer':
            case 'have-remote-pranswer':
            case 'closed':
            default:
                return Promise.reject(new Error('Invalid signaling state ' + this._peerConnection.signalingState));
        }
        if (!sdp) {
            this.logger.error('SessionDescriptionHandler.setRemoteSessionDescription failed - cannot set null sdp');
            return Promise.reject(new Error('SDP is undefined'));
        }
        return this._peerConnection.setRemoteDescription({ sdp: sdp, type: type });
    };
    /**
     * Sets a remote media stream track.
     *
     * @remarks
     * Adds tracks if audio and/or video tracks are not already present, otherwise replaces tracks.
     *
     * @param track - Media stream track to be utilized.
     */
    SessionDescriptionHandler.prototype.setRemoteTrack = function (track) {
        this.logger.debug('SessionDescriptionHandler.setRemoteTrack');
        var remoteStream = this._remoteMediaStream;
        if (remoteStream.getTrackById(track.id)) {
            this.logger.debug("SessionDescriptionHandler.setRemoteTrack - have remote ".concat(track.kind, " track"));
        }
        else if (track.kind === 'audio') {
            this.logger.debug("SessionDescriptionHandler.setRemoteTrack - adding remote ".concat(track.kind, " track"));
            remoteStream.getAudioTracks().forEach(function (track) {
                track.stop();
                remoteStream.removeTrack(track);
                SessionDescriptionHandler.dispatchRemoveTrackEvent(remoteStream, track);
            });
            remoteStream.addTrack(track);
            SessionDescriptionHandler.dispatchAddTrackEvent(remoteStream, track);
        }
        else if (track.kind === 'video') {
            this.logger.debug("SessionDescriptionHandler.setRemoteTrack - adding remote ".concat(track.kind, " track"));
            remoteStream.getVideoTracks().forEach(function (track) {
                track.stop();
                remoteStream.removeTrack(track);
                SessionDescriptionHandler.dispatchRemoveTrackEvent(remoteStream, track);
            });
            remoteStream.addTrack(track);
            SessionDescriptionHandler.dispatchAddTrackEvent(remoteStream, track);
        }
    };
    /**
     * Depending on the current signaling state and the session hold state, update transceiver direction.
     * @param options - Session description handler options.
     */
    SessionDescriptionHandler.prototype.updateDirection = function (options) {
        var _this = this;
        if (this._peerConnection === undefined) {
            return Promise.reject(new Error('Peer connection closed.'));
        }
        // 4.2.3.  setDirection
        //
        //    The setDirection method sets the direction of a transceiver, which
        //    affects the direction property of the associated "m=" section on
        //    future calls to createOffer and createAnswer.  The permitted values
        //    for direction are "recvonly", "sendrecv", "sendonly", and "inactive",
        //    mirroring the identically named direction attributes defined in
        //    [RFC4566], Section 6.
        //
        //    When creating offers, the transceiver direction is directly reflected
        //    in the output, even for re-offers.  When creating answers, the
        //    transceiver direction is intersected with the offered direction, as
        //    explained in Section 5.3 below.
        //
        //    Note that while setDirection sets the direction property of the
        //    transceiver immediately (Section 4.2.4), this property does not
        //    immediately affect whether the transceiver's RtpSender will send or
        //    its RtpReceiver will receive.  The direction in effect is represented
        //    by the currentDirection property, which is only updated when an
        //    answer is applied.
        //
        // 4.2.4.  direction
        //
        //    The direction property indicates the last value passed into
        //    setDirection.  If setDirection has never been called, it is set to
        //    the direction the transceiver was initialized with.
        //
        // 4.2.5.  currentDirection
        //
        //    The currentDirection property indicates the last negotiated direction
        //    for the transceiver's associated "m=" section.  More specifically, it
        //    indicates the direction attribute [RFC3264] of the associated "m="
        //    section in the last applied answer (including provisional answers),
        //    with "send" and "recv" directions reversed if it was a remote answer.
        //    For example, if the direction attribute for the associated "m="
        //    section in a remote answer is "recvonly", currentDirection is set to
        //    "sendonly".
        //
        //    If an answer that references this transceiver has not yet been
        //    applied or if the transceiver is stopped, currentDirection is set to
        //    "null".
        //  https://tools.ietf.org/html/rfc8829#section-4.2.3
        //
        // *  A direction attribute, determined by applying the rules regarding
        //    the offered direction specified in [RFC3264], Section 6.1, and
        //    then intersecting with the direction of the associated
        //    RtpTransceiver.  For example, in the case where an "m=" section is
        //    offered as "sendonly" and the local transceiver is set to
        //    "sendrecv", the result in the answer is a "recvonly" direction.
        // https://tools.ietf.org/html/rfc8829#section-5.3.1
        //
        // If a stream is offered as sendonly, the corresponding stream MUST be
        // marked as recvonly or inactive in the answer.  If a media stream is
        // listed as recvonly in the offer, the answer MUST be marked as
        // sendonly or inactive in the answer.  If an offered media stream is
        // listed as sendrecv (or if there is no direction attribute at the
        // media or session level, in which case the stream is sendrecv by
        // default), the corresponding stream in the answer MAY be marked as
        // sendonly, recvonly, sendrecv, or inactive.  If an offered media
        // stream is listed as inactive, it MUST be marked as inactive in the
        // answer.
        // https://tools.ietf.org/html/rfc3264#section-6.1
        switch (this._peerConnection.signalingState) {
            case 'stable':
                // if we are stable, assume we are creating a local offer
                this.logger.debug('SessionDescriptionHandler.updateDirection - setting offer direction');
                {
                    // determine the direction to offer given the current direction and hold state
                    var directionToOffer_1 = function (currentDirection) {
                        switch (currentDirection) {
                            case 'inactive':
                                return (options === null || options === void 0 ? void 0 : options.hold) ? 'inactive' : 'recvonly';
                            case 'recvonly':
                                return (options === null || options === void 0 ? void 0 : options.hold) ? 'inactive' : 'recvonly';
                            case 'sendonly':
                                return (options === null || options === void 0 ? void 0 : options.hold) ? 'sendonly' : 'sendrecv';
                            case 'sendrecv':
                                return (options === null || options === void 0 ? void 0 : options.hold) ? 'sendonly' : 'sendrecv';
                            case 'stopped':
                                return 'stopped';
                            default:
                                throw new Error('Should never happen');
                        }
                    };
                    // set the transceiver direction to the offer direction
                    this._peerConnection.getTransceivers().forEach(function (transceiver) {
                        if (transceiver.direction /* guarding, but should always be true */) {
                            var offerDirection = directionToOffer_1(transceiver.direction);
                            if (transceiver.direction !== offerDirection) {
                                transceiver.direction = offerDirection;
                            }
                        }
                    });
                }
                break;
            case 'have-remote-offer':
                // if we have a remote offer, assume we are creating a local answer
                this.logger.debug('SessionDescriptionHandler.updateDirection - setting answer direction');
                // FIXME: This is not the correct way to determine the answer direction as it is only
                // considering first match in the offered SDP and using that to determine the answer direction.
                // While that may be fine for our current use cases, it is not a generally correct approach.
                {
                    // determine the offered direction
                    var offeredDirection_1 = (function () {
                        var description = _this._peerConnection.remoteDescription;
                        if (!description) {
                            throw new Error('Failed to read remote offer');
                        }
                        var searchResult = /a=sendrecv\r\n|a=sendonly\r\n|a=recvonly\r\n|a=inactive\r\n/.exec(description.sdp);
                        if (searchResult) {
                            switch (searchResult[0]) {
                                case 'a=inactive\r\n':
                                    return 'inactive';
                                case 'a=recvonly\r\n':
                                    return 'recvonly';
                                case 'a=sendonly\r\n':
                                    return 'sendonly';
                                case 'a=sendrecv\r\n':
                                    return 'sendrecv';
                                default:
                                    throw new Error('Should never happen');
                            }
                        }
                        return 'sendrecv';
                    })();
                    // determine the answer direction based on the offered direction and our hold state
                    var answerDirection_1 = (function () {
                        switch (offeredDirection_1) {
                            case 'inactive':
                                return 'inactive';
                            case 'recvonly':
                                return 'sendonly';
                            case 'sendonly':
                                return (options === null || options === void 0 ? void 0 : options.hold) ? 'inactive' : 'recvonly';
                            case 'sendrecv':
                                return (options === null || options === void 0 ? void 0 : options.hold) ? 'sendonly' : 'sendrecv';
                            default:
                                throw new Error('Should never happen');
                        }
                    })();
                    // set the transceiver direction to the answer direction
                    this._peerConnection.getTransceivers().forEach(function (transceiver) {
                        if (transceiver.direction /* guarding, but should always be true */) {
                            if (transceiver.direction !== 'stopped' && transceiver.direction !== answerDirection_1) {
                                transceiver.direction = answerDirection_1;
                            }
                        }
                    });
                }
                break;
            case 'have-local-offer':
            case 'have-local-pranswer':
            case 'have-remote-pranswer':
            case 'closed':
            default:
                return Promise.reject(new Error('Invalid signaling state ' + this._peerConnection.signalingState));
        }
        return Promise.resolve();
    };
    /**
     * Called when ICE gathering completes and resolves any waiting promise.
     */
    SessionDescriptionHandler.prototype.iceGatheringComplete = function () {
        this.logger.debug('SessionDescriptionHandler.iceGatheringComplete');
        // clear timer if need be
        if (this.iceGatheringCompleteTimeoutId !== undefined) {
            this.logger.debug('SessionDescriptionHandler.iceGatheringComplete - clearing timeout');
            clearTimeout(this.iceGatheringCompleteTimeoutId);
            this.iceGatheringCompleteTimeoutId = undefined;
        }
        // resolve and cleanup promise if need be
        if (this.iceGatheringCompletePromise !== undefined) {
            this.logger.debug('SessionDescriptionHandler.iceGatheringComplete - resolving promise');
            this.iceGatheringCompleteResolve && this.iceGatheringCompleteResolve();
            this.iceGatheringCompletePromise = undefined;
            this.iceGatheringCompleteResolve = undefined;
            this.iceGatheringCompleteReject = undefined;
        }
    };
    /**
     * Wait for ICE gathering to complete.
     * @param restart - If true, waits if current state is "complete" (waits for transition to "complete").
     * @param timeout - Milliseconds after which waiting times out. No timeout if 0.
     */
    SessionDescriptionHandler.prototype.waitForIceGatheringComplete = function (restart, timeout) {
        var _this = this;
        if (restart === void 0) { restart = false; }
        if (timeout === void 0) { timeout = 0; }
        this.logger.debug('SessionDescriptionHandler.waitForIceGatheringToComplete');
        if (this._peerConnection === undefined) {
            return Promise.reject('Peer connection closed.');
        }
        // guard already complete
        if (!restart && this._peerConnection.iceGatheringState === 'complete') {
            this.logger.debug('SessionDescriptionHandler.waitForIceGatheringToComplete - already complete');
            return Promise.resolve();
        }
        // only one may be waiting, reject any prior
        if (this.iceGatheringCompletePromise !== undefined) {
            this.logger.debug('SessionDescriptionHandler.waitForIceGatheringToComplete - rejecting prior waiting promise');
            this.iceGatheringCompleteReject && this.iceGatheringCompleteReject(new Error('Promise superseded.'));
            this.iceGatheringCompletePromise = undefined;
            this.iceGatheringCompleteResolve = undefined;
            this.iceGatheringCompleteReject = undefined;
        }
        this.iceGatheringCompletePromise = new Promise(function (resolve, reject) {
            _this.iceGatheringCompleteResolve = resolve;
            _this.iceGatheringCompleteReject = reject;
            if (timeout > 0) {
                _this.logger.debug('SessionDescriptionHandler.waitForIceGatheringToComplete - timeout in ' + timeout);
                _this.iceGatheringCompleteTimeoutId = setTimeout(function () {
                    _this.logger.debug('SessionDescriptionHandler.waitForIceGatheringToComplete - timeout');
                    _this.iceGatheringComplete();
                }, timeout);
            }
        });
        return this.iceGatheringCompletePromise;
    };
    /**
     * Initializes the peer connection event handlers
     */
    SessionDescriptionHandler.prototype.initPeerConnectionEventHandlers = function () {
        var _this = this;
        this.logger.debug('SessionDescriptionHandler.initPeerConnectionEventHandlers');
        if (!this._peerConnection) {
            throw new Error('Peer connection undefined.');
        }
        var peerConnection = this._peerConnection;
        peerConnection.onconnectionstatechange = function (event) {
            var _a;
            var newState = peerConnection.connectionState;
            _this.logger.debug("SessionDescriptionHandler.onconnectionstatechange ".concat(newState));
            if ((_a = _this._peerConnectionDelegate) === null || _a === void 0 ? void 0 : _a.onconnectionstatechange) {
                _this._peerConnectionDelegate.onconnectionstatechange(event);
            }
        };
        peerConnection.ondatachannel = function (event) {
            var _a;
            _this.logger.debug("SessionDescriptionHandler.ondatachannel");
            _this._dataChannel = event.channel;
            if (_this.onDataChannel) {
                _this.onDataChannel(_this._dataChannel);
            }
            if ((_a = _this._peerConnectionDelegate) === null || _a === void 0 ? void 0 : _a.ondatachannel) {
                _this._peerConnectionDelegate.ondatachannel(event);
            }
        };
        peerConnection.onicecandidate = function (event) {
            var _a;
            _this.logger.debug("SessionDescriptionHandler.onicecandidate");
            if ((_a = _this._peerConnectionDelegate) === null || _a === void 0 ? void 0 : _a.onicecandidate) {
                _this._peerConnectionDelegate.onicecandidate(event);
            }
        };
        peerConnection.onicecandidateerror = function (event) {
            var _a;
            _this.logger.debug("SessionDescriptionHandler.onicecandidateerror");
            if ((_a = _this._peerConnectionDelegate) === null || _a === void 0 ? void 0 : _a.onicecandidateerror) {
                _this._peerConnectionDelegate.onicecandidateerror(event);
            }
        };
        peerConnection.oniceconnectionstatechange = function (event) {
            var _a;
            var newState = peerConnection.iceConnectionState;
            _this.logger.debug("SessionDescriptionHandler.oniceconnectionstatechange ".concat(newState));
            if ((_a = _this._peerConnectionDelegate) === null || _a === void 0 ? void 0 : _a.oniceconnectionstatechange) {
                _this._peerConnectionDelegate.oniceconnectionstatechange(event);
            }
        };
        peerConnection.onicegatheringstatechange = function (event) {
            var _a;
            var newState = peerConnection.iceGatheringState;
            _this.logger.debug("SessionDescriptionHandler.onicegatheringstatechange ".concat(newState));
            if (newState === 'complete') {
                _this.iceGatheringComplete(); // complete waiting for ICE gathering to complete
            }
            if ((_a = _this._peerConnectionDelegate) === null || _a === void 0 ? void 0 : _a.onicegatheringstatechange) {
                _this._peerConnectionDelegate.onicegatheringstatechange(event);
            }
        };
        peerConnection.onnegotiationneeded = function (event) {
            var _a;
            _this.logger.debug("SessionDescriptionHandler.onnegotiationneeded");
            if ((_a = _this._peerConnectionDelegate) === null || _a === void 0 ? void 0 : _a.onnegotiationneeded) {
                _this._peerConnectionDelegate.onnegotiationneeded(event);
            }
        };
        peerConnection.onsignalingstatechange = function (event) {
            var _a;
            var newState = peerConnection.signalingState;
            _this.logger.debug("SessionDescriptionHandler.onsignalingstatechange ".concat(newState));
            if ((_a = _this._peerConnectionDelegate) === null || _a === void 0 ? void 0 : _a.onsignalingstatechange) {
                _this._peerConnectionDelegate.onsignalingstatechange(event);
            }
        };
        // onstatsended is no longer a part of PeerConnection as per the specs so removing it
        // peerConnection.onstatsended = (event): void => {
        //     this.logger.debug(`SessionDescriptionHandler.onstatsended`);
        //     if (this._peerConnectionDelegate?.onstatsended) {
        //         this._peerConnectionDelegate.onstatsended(event);
        //     }
        // };
        peerConnection.ontrack = function (event) {
            var _a;
            var kind = event.track.kind;
            var enabled = event.track.enabled ? 'enabled' : 'disabled';
            _this.logger.debug("SessionDescriptionHandler.ontrack ".concat(kind, " ").concat(enabled));
            _this.setRemoteTrack(event.track);
            if ((_a = _this._peerConnectionDelegate) === null || _a === void 0 ? void 0 : _a.ontrack) {
                _this._peerConnectionDelegate.ontrack(event);
            }
        };
    };
    return SessionDescriptionHandler;
}());
exports.SessionDescriptionHandler = SessionDescriptionHandler;
function defaultPeerConnectionConfiguration() {
    return {
        bundlePolicy: 'balanced',
        certificates: undefined,
        iceCandidatePoolSize: 0,
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        iceTransportPolicy: 'all',
        peerIdentity: undefined,
        rtcpMuxPolicy: 'require'
    };
}
exports.defaultPeerConnectionConfiguration = defaultPeerConnectionConfiguration;
function defaultMediaStreamFactory() {
    return function (constraints) {
        // if no audio or video, return a media stream without tracks
        if (!constraints.audio && !constraints.video) {
            return Promise.resolve(new MediaStream());
        }
        // getUserMedia() is a powerful feature which can only be used in secure contexts; in insecure contexts,
        // navigator.mediaDevices is undefined, preventing access to getUserMedia(). A secure context is, in short,
        // a page loaded using HTTPS or the file:/// URL scheme, or a page loaded from localhost.
        // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Privacy_and_security
        if (navigator.mediaDevices === undefined) {
            return Promise.reject(new Error('Media devices not available in insecure contexts.'));
        }
        return navigator.mediaDevices.getUserMedia.call(navigator.mediaDevices, constraints);
    };
}
exports.defaultMediaStreamFactory = defaultMediaStreamFactory;
var defaultSessionDescriptionFactory = function (session, options) {
    var mediaStreamFactory = defaultMediaStreamFactory();
    // make sure we allow `0` to be passed in so timeout can be disabled
    var iceGatheringTimeout = (options === null || options === void 0 ? void 0 : options.iceGatheringTimeout) !== undefined ? options === null || options === void 0 ? void 0 : options.iceGatheringTimeout : 5000;
    // merge passed factory options into default session description configuration
    var sessionDescriptionHandlerConfiguration = {
        iceGatheringTimeout: iceGatheringTimeout,
        enableDscp: options.enableDscp,
        peerConnectionConfiguration: __assign(__assign({}, defaultPeerConnectionConfiguration()), options === null || options === void 0 ? void 0 : options.peerConnectionConfiguration)
    };
    var logger = session.userAgent.getLogger('sip.SessionDescriptionHandler');
    return new SessionDescriptionHandler(logger, mediaStreamFactory, sessionDescriptionHandlerConfiguration);
};
exports.defaultSessionDescriptionFactory = defaultSessionDescriptionFactory;
//# sourceMappingURL=sessionDescriptionHandler.js.map