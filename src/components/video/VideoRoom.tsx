'use client';

import { useEffect, useCallback, useState } from 'react';
import {
  DailyProvider,
  useDaily,
  useLocalParticipant,
  useParticipantIds,
  useDailyEvent,
  DailyVideo,
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

  return (
    <div className={`relative rounded-xl overflow-hidden bg-charcoal ${isLocal ? 'w-48 h-36' : 'flex-1 min-h-[300px]'}`}>
      <DailyVideo
        automirror
        sessionId={participantId}
        type="video"
        className="w-full h-full object-cover"
      />
      {!videoTrack?.state || videoTrack.state === 'off' ? (
        <div className="absolute inset-0 flex items-center justify-center bg-charcoal">
          <div className="w-20 h-20 rounded-full bg-warm-gray/30 flex items-center justify-center">
            <span className="text-3xl text-cream">👤</span>
          </div>
        </div>
      ) : null}
      {isLocal && (
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
          You
        </div>
      )}
    </div>
  );
}

function Controls({ onLeave }: { onLeave?: () => void }) {
  const daily = useDaily();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const toggleAudio = useCallback(() => {
    if (daily) {
      daily.setLocalAudio(isMuted);
      setIsMuted(!isMuted);
    }
  }, [daily, isMuted]);

  const toggleVideo = useCallback(() => {
    if (daily) {
      daily.setLocalVideo(isVideoOff);
      setIsVideoOff(!isVideoOff);
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
    <div className="flex items-center justify-center gap-4 p-4 bg-white rounded-xl shadow-lg">
      <button
        onClick={toggleAudio}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
          isMuted ? 'bg-error text-white' : 'bg-linen text-charcoal hover:bg-gray-200'
        }`}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>

      <button
        onClick={toggleVideo}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
          isVideoOff ? 'bg-error text-white' : 'bg-linen text-charcoal hover:bg-gray-200'
        }`}
        title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
      >
        {isVideoOff ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>

      <button
        onClick={handleLeave}
        className="w-14 h-14 rounded-full bg-error text-white flex items-center justify-center hover:bg-red-700 transition-colors"
        title="Leave meeting"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      daily.join({ userName }).catch((err) => {
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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-sage border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-warm-gray">Joining meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Video Grid */}
      <div className="flex-1 p-4 flex gap-4">
        {/* Remote Participants */}
        {remoteParticipantIds.length > 0 ? (
          <div className="flex-1 flex gap-4">
            {remoteParticipantIds.map((id) => (
              <VideoTile key={id} participantId={id} />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-linen rounded-xl">
            <div className="text-center">
              <p className="text-xl text-charcoal mb-2">Waiting for others to join...</p>
              <p className="text-warm-gray">Share this room link with the other participants</p>
            </div>
          </div>
        )}

        {/* Local Video (Picture-in-Picture style) */}
        {localParticipant && (
          <div className="absolute bottom-24 right-8">
            <VideoTile participantId={localParticipant.session_id} isLocal />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 flex justify-center">
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
