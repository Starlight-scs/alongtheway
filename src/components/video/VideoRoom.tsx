'use client';

import { useEffect, useCallback, useState } from 'react';
import {
  DailyProvider,
  useDaily,
  useLocalParticipant,
  useParticipantIds,
  useDailyEvent,
  DailyVideo,
  DailyAudio,
  useVideoTrack,
  useAudioTrack,
} from '@daily-co/daily-react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { Button } from '@/components/ui/Button';

interface VideoRoomProps {
  roomUrl: string;
  userName: string;
  onLeave?: () => void;
}

// Module-level singleton to prevent duplicate instances
let globalCallObject: DailyCall | null = null;

function getOrCreateCallObject(url: string): DailyCall {
  if (globalCallObject) {
    return globalCallObject;
  }
  globalCallObject = DailyIframe.createCallObject({ url });
  return globalCallObject;
}

function destroyCallObject() {
  if (globalCallObject) {
    globalCallObject.destroy();
    globalCallObject = null;
  }
}

function VideoTile({ participantId, isLocal }: { participantId: string; isLocal?: boolean }) {
  const videoTrack = useVideoTrack(participantId);
  const audioTrack = useAudioTrack(participantId);
  const isAudioOff = !audioTrack?.state || audioTrack.state === 'off';

  return (
    <div className={`relative rounded-lg overflow-hidden bg-charcoal ${isLocal ? 'w-32 h-24 shadow-lg border-2 border-white/20' : 'w-full h-full'}`}>
      <DailyVideo
        automirror
        sessionId={participantId}
        type="video"
        className="w-full h-full object-cover"
      />
      {!videoTrack?.state || videoTrack.state === 'off' ? (
        <div className="absolute inset-0 flex items-center justify-center bg-charcoal">
          <div className={`${isLocal ? 'w-10 h-10' : 'w-16 h-16'} rounded-full bg-warm-gray/30 flex items-center justify-center`}>
            <span className={`${isLocal ? 'text-xl' : 'text-2xl'} text-cream`}>👤</span>
          </div>
        </div>
      ) : null}
      {/* Audio indicator */}
      {isAudioOff && (
        <div className={`absolute ${isLocal ? 'top-1 right-1' : 'top-2 right-2'} p-1 bg-red-500/80 rounded-full`}>
          <svg className={`${isLocal ? 'w-3 h-3' : 'w-4 h-4'} text-white`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        </div>
      )}
      {isLocal && (
        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white">
          You
        </div>
      )}
    </div>
  );
}

function Controls({ onLeave }: { onLeave?: () => void }) {
  const daily = useDaily();
  const localParticipant = useLocalParticipant();

  // Get actual track states from the participant
  const isMuted = !localParticipant?.tracks?.audio?.state || localParticipant?.tracks?.audio?.state === 'off';
  const isVideoOff = !localParticipant?.tracks?.video?.state || localParticipant?.tracks?.video?.state === 'off';

  const toggleAudio = useCallback(() => {
    if (daily) {
      daily.setLocalAudio(isMuted); // If muted, unmute (pass true), if unmuted, mute (pass false)
    }
  }, [daily, isMuted]);

  const toggleVideo = useCallback(() => {
    if (daily) {
      daily.setLocalVideo(isVideoOff); // If off, turn on (pass true), if on, turn off (pass false)
    }
  }, [daily, isVideoOff]);

  const handleLeave = useCallback(() => {
    if (daily) {
      daily.leave();
    }
    destroyCallObject();
    onLeave?.();
  }, [daily, onLeave]);

  return (
    <div className="flex items-center justify-center gap-3 p-3 bg-black/40 backdrop-blur-sm rounded-full">
      <button
        onClick={toggleAudio}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
          isMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
        }`}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>

      <button
        onClick={toggleVideo}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
          isVideoOff ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
        }`}
        title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
      >
        {isVideoOff ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>

      <button
        onClick={handleLeave}
        className="w-11 h-11 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
        title="Leave meeting"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
        </svg>
      </button>
    </div>
  );
}

function CallUI({ userName, onLeave }: { userName: string; onLeave?: () => void }) {
  const daily = useDaily();
  const localParticipant = useLocalParticipant();
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' });
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useDailyEvent('joined-meeting', () => {
    setJoined(true);
  });

  useDailyEvent('error', (event) => {
    setError(event?.errorMsg || 'An error occurred');
  });

  useEffect(() => {
    if (daily && !joined) {
      daily.join({
        userName,
        startVideoOff: false,
        startAudioOff: false,
      }).catch((err) => {
        setError(err.message || 'Failed to join meeting');
      });
    }
  }, [daily, joined, userName]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <p className="text-error mb-4">{error}</p>
        <Button onClick={onLeave}>Go Back</Button>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="flex items-center justify-center h-full bg-charcoal">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-sage border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">Joining meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-charcoal overflow-hidden">
      {/* Audio for all participants - this enables receiving remote audio */}
      <DailyAudio />

      {/* Main Video Area */}
      <div className="absolute inset-0">
        {remoteParticipantIds.length > 0 ? (
          <div className="w-full h-full flex">
            {remoteParticipantIds.map((id) => (
              <VideoTile key={id} participantId={id} />
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">👤</span>
              </div>
              <p className="text-lg text-white mb-1">Waiting for others to join...</p>
              <p className="text-white/50 text-sm">Share this room link with the other participants</p>
            </div>
          </div>
        )}
      </div>

      {/* Local Video (Picture-in-Picture) */}
      {localParticipant && (
        <div className="absolute bottom-20 right-4 z-10">
          <VideoTile participantId={localParticipant.session_id} isLocal />
        </div>
      )}

      {/* Controls - Overlaid on video */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <Controls onLeave={onLeave} />
      </div>
    </div>
  );
}

export function VideoRoom({ roomUrl, userName, onLeave }: VideoRoomProps) {
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Destroy any existing call object first
    destroyCallObject();

    // Small delay to ensure cleanup is complete
    const timer = setTimeout(() => {
      const co = getOrCreateCallObject(roomUrl);
      setCallObject(co);
      setIsReady(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      destroyCallObject();
    };
  }, [roomUrl]);

  if (!isReady || !callObject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-sage border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <DailyProvider callObject={callObject}>
      <CallUI userName={userName} onLeave={onLeave} />
    </DailyProvider>
  );
}
