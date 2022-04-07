export interface RTPReport {
    outboundRtpReport: OutboundRtpReport;
    inboundRtpReport: InboundRtpReport;
    rttMs: RttReport;
    localCandidates?: object[];
    remoteCandidates?: object[];
    transport?: any;
}
export declare type InboundRtpReport = {
    mediaType?: string;
    packetsReceived?: number;
    bytesReceived?: number;
    packetsLost?: number;
    jitter?: number;
    fractionLost?: number;
    roundTripTime?: number;
    rtpRemoteAudioLevel?: number;
};
export declare type OutboundRtpReport = {
    mediaType?: string;
    packetsSent?: number;
    bytesSent?: number;
    rtpLocalAudioLevel?: number;
};
export declare type RttReport = {
    currentRoundTripTime?: number;
    roundTripTime?: number;
};
export declare function isNoAudio(report: RTPReport): boolean;
