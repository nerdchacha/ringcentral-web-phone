"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Events = void 0;
/** @ignore */
exports.Events = {
    Transport: {
        Connecting: 'connecting',
        Connected: 'connected',
        Disconnecting: 'disconnecting',
        Disconnected: 'disconnected',
        ConnectionAttemptFailure: 'wsConnectionError',
        ConnectionFailure: 'transportError',
        SwitchBackToMainProxy: 'switchBackProxy',
        Closed: 'closed'
    },
    UserAgent: {
        Registered: 'registered',
        Unregistered: 'unregistered',
        InviteSent: 'inviteSent',
        Invite: 'invite',
        ProvisionUpdate: 'ProvisionUpdate',
        Started: 'started',
        Stopped: 'stopped'
    },
    Session: {
        Accepted: 'accepted',
        Progress: 'progress',
        Muted: 'muted',
        Unmuted: 'unmuted',
        Establishing: 'establishing',
        Established: 'established',
        Terminating: 'terminating',
        Terminated: 'terminated',
        UpdateReceived: 'updateReceived',
        MoveToRcv: 'moveToRcv',
        QOSPublished: 'qos-published',
        RTPStat: 'rtpStat',
        SessionDescriptionHandlerCreated: 'sessionDescriptionHandlerCreated',
        UserMediaFailed: 'UserMediaFailed',
    }
};
//# sourceMappingURL=events.js.map