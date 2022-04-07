"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioHelper = void 0;
var AudioHelper = /** @class */ (function () {
    function AudioHelper(options) {
        if (options === void 0) { options = {}; }
        this._enabled = !!options.enabled;
        this.loadAudio(options);
    }
    AudioHelper.prototype._playSound = function (url, val, volume) {
        if (!this._enabled || !url) {
            return this;
        }
        if (!this._audio[url]) {
            if (val) {
                this._audio[url] = new Audio();
                this._audio[url].src = url;
                this._audio[url].loop = true;
                this._audio[url].volume = volume;
                this._audio[url].playPromise = this._audio[url].play();
            }
        }
        else {
            if (val) {
                this._audio[url].currentTime = 0;
                this._audio[url].playPromise = this._audio[url].play();
            }
            else {
                var audio = this._audio[url];
                if (audio.playPromise !== undefined) {
                    audio.playPromise.then(function () {
                        audio.pause();
                    });
                }
            }
        }
        return this;
    };
    /** Load incoming and outgoing audio files for feedback */
    AudioHelper.prototype.loadAudio = function (options) {
        this._incoming = options.incoming;
        this._outgoing = options.outgoing;
        this._audio = {};
    };
    /** Set volume for icoming and outgoing feedback */
    AudioHelper.prototype.setVolume = function (volume) {
        if (volume < 0) {
            volume = 0;
        }
        if (volume > 1) {
            volume = 1;
        }
        this.volume = volume;
        for (var url in this._audio) {
            if (this._audio.hasOwnProperty(url)) {
                this._audio[url].volume = volume;
            }
        }
    };
    /**
     * Play or pause incoming feedback
     * @param value `true` to play audio and `false` to pause
     * @returns
     */
    AudioHelper.prototype.playIncoming = function (value) {
        return this._playSound(this._incoming, value, this.volume || 0.5);
    };
    /**
     * Play or pause outgoing feedback
     * @param value `true` to play audio and `false` to pause
     * @returns
     */
    AudioHelper.prototype.playOutgoing = function (value) {
        return this._playSound(this._outgoing, value, this.volume || 1);
    };
    return AudioHelper;
}());
exports.AudioHelper = AudioHelper;
//# sourceMappingURL=audioHelper.js.map