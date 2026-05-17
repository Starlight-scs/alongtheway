'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
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
  isHost?: boolean;
}

// Module-level singleton to prevent duplicate instances
let globalCallObject: DailyCall | null = null;

function getOrCreateCallObject(url: string): DailyCall {
  if (globalCallObject) {
    return globalCallObject;
  }
  globalCallObject = DailyIframe.createCallObject({
    url,
    startVideoOff: false,
    startAudioOff: false,
  });
  return globalCallObject;
}

// Properly stop all media tracks and destroy call object
async function destroyCallObject() {
  if (globalCallObject) {
    try {
      // Turn off local video and audio first
      globalCallObject.setLocalVideo(false);
      globalCallObject.setLocalAudio(false);

      // Leave the meeting if still connected
      const meetingState = globalCallObject.meetingState();
      if (meetingState === 'joined-meeting') {
        await globalCallObject.leave();
      }

      // Destroy the call object (this should release all tracks)
      await globalCallObject.destroy();
    } catch (e) {
      console.error('Error destroying call object:', e);
    }
    globalCallObject = null;
  }

  // Extra safety: stop any remaining media tracks in the browser
  try {
    const streams = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).catch(() => null);
    if (streams) {
      streams.getTracks().forEach(track => track.stop());
    }
  } catch (e) {
    // Ignore errors - just trying to clean up
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

function Controls({ onLeave, isHost, onToggleSettings }: { onLeave?: () => void; isHost?: boolean; onToggleSettings?: () => void }) {
  const daily = useDaily();
  const localParticipant = useLocalParticipant();
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);

  const audioState = localParticipant?.tracks?.audio?.state;
  const videoState = localParticipant?.tracks?.video?.state;

  const isMuted = !audioState || audioState === 'off' || audioState === 'blocked';
  const isVideoOff = !videoState || videoState === 'off' || videoState === 'blocked';

  useEffect(() => {
    if (audioState === 'playable' || audioState === 'sendable') {
      setLocalAudioEnabled(true);
    } else if (audioState === 'off') {
      setLocalAudioEnabled(false);
    }
  }, [audioState]);

  useEffect(() => {
    if (videoState === 'playable' || videoState === 'sendable') {
      setLocalVideoEnabled(true);
    } else if (videoState === 'off') {
      setLocalVideoEnabled(false);
    }
  }, [videoState]);

  const toggleAudio = useCallback(() => {
    if (daily) {
      const newState = !localAudioEnabled;
      daily.setLocalAudio(newState);
      setLocalAudioEnabled(newState);
    }
  }, [daily, localAudioEnabled]);

  const toggleVideo = useCallback(() => {
    if (daily) {
      const newState = !localVideoEnabled;
      daily.setLocalVideo(newState);
      setLocalVideoEnabled(newState);
    }
  }, [daily, localVideoEnabled]);

  const handleLeave = useCallback(async () => {
    if (daily) {
      try {
        // Turn off camera and mic
        daily.setLocalVideo(false);
        daily.setLocalAudio(false);

        // Leave the meeting
        await daily.leave();
      } catch (e) {
        console.error('Error leaving meeting:', e);
      }
    }

    // Destroy the call object and clean up tracks
    await destroyCallObject();

    onLeave?.();
  }, [daily, onLeave]);

  const showMuted = !localAudioEnabled || isMuted;
  const showVideoOff = !localVideoEnabled || isVideoOff;

  return (
    <div className="flex items-center justify-center gap-3 p-3 bg-black/40 backdrop-blur-sm rounded-full">
      <button
        onClick={toggleAudio}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
          showMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
        }`}
        title={showMuted ? 'Unmute' : 'Mute'}
      >
        {showMuted ? (
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
          showVideoOff ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
        }`}
        title={showVideoOff ? 'Turn on camera' : 'Turn off camera'}
      >
        {showVideoOff ? (
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

      {isHost && (
        <button
          onClick={onToggleSettings}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-colors bg-white/20 text-white hover:bg-white/30"
          title="Audio Settings"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}

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

// Host control panel for managing audio settings
function HostControlPanel({ onClose }: { onClose: () => void }) {
  const daily = useDaily();
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' });
  const [volume, setVolume] = useState(100);
  const [isMutedAll, setIsMutedAll] = useState(false);
  const audioContainerRef = useRef<HTMLDivElement>(null);

  // Update volume on all audio elements
  const applyVolume = useCallback((vol: number) => {
    // Target audio elements within the page
    const audioElements = document.getElementsByTagName('audio');
    for (let i = 0; i < audioElements.length; i++) {
      audioElements[i].volume = vol / 100;
    }
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    setIsMutedAll(newVolume === 0);
    applyVolume(newVolume);
  }, [applyVolume]);

  // Mute all by setting volume to 0
  const muteAllParticipants = useCallback(() => {
    applyVolume(0);
    setIsMutedAll(true);
  }, [applyVolume]);

  // Unmute all by restoring volume
  const unmuteAllParticipants = useCallback(() => {
    applyVolume(volume > 0 ? volume : 100);
    setIsMutedAll(false);
    if (volume === 0) setVolume(100);
  }, [applyVolume, volume]);

  return (
    <div className="absolute top-4 right-4 z-20 bg-black/80 backdrop-blur-md rounded-xl p-4 min-w-[280px] text-white shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Host Controls</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Master Volume */}
      <div className="mb-4">
        <label className="text-xs text-white/70 mb-2 block">Master Volume {isMutedAll && '(Muted)'}</label>
        <div className="flex items-center gap-3">
          <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          <input
            type="range"
            min="0"
            max="100"
            value={isMutedAll ? 0 : volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="flex-1 h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-sage"
          />
          <span className="text-xs w-8 text-right">{isMutedAll ? 0 : volume}%</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={muteAllParticipants}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            isMutedAll
              ? 'bg-red-500/40 text-red-300'
              : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
          }`}
        >
          {isMutedAll ? 'Muted' : 'Mute All'}
        </button>
        <button
          onClick={unmuteAllParticipants}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            !isMutedAll
              ? 'bg-green-500/40 text-green-300'
              : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
          }`}
        >
          {!isMutedAll ? 'Unmuted' : 'Unmute All'}
        </button>
      </div>

      {/* Participant List */}
      {remoteParticipantIds.length > 0 && (
        <div>
          <label className="text-xs text-white/70 mb-2 block">Participants ({remoteParticipantIds.length})</label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {remoteParticipantIds.map((id) => (
              <ParticipantInfo key={id} participantId={id} />
            ))}
          </div>
        </div>
      )}

      {remoteParticipantIds.length === 0 && (
        <p className="text-xs text-white/50 text-center py-2">No participants yet</p>
      )}
    </div>
  );
}

// Simple participant info display
function ParticipantInfo({ participantId }: { participantId: string }) {
  const daily = useDaily();
  const audioTrack = useAudioTrack(participantId);
  const participants = daily?.participants();
  const participant = participants?.[participantId];
  const hasAudio = audioTrack?.state === 'playable';

  return (
    <div className="flex items-center justify-between p-2 bg-white/10 rounded-lg">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-xs">👤</span>
        </div>
        <span className="text-xs truncate max-w-[120px]">
          {participant?.user_name || 'Participant'}
        </span>
      </div>
      <div className={`p-1.5 rounded-full ${hasAudio ? 'bg-green-500/30 text-green-400' : 'bg-red-500/30 text-red-400'}`}>
        {hasAudio ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        )}
      </div>
    </div>
  );
}

function CallUI({ userName, onLeave, isHost }: { userName: string; onLeave?: () => void; isHost?: boolean }) {
  const daily = useDaily();
  const localParticipant = useLocalParticipant();
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' });
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useDailyEvent('joined-meeting', () => {
    setJoined(true);
    if (daily) {
      daily.setLocalAudio(true);
      daily.setLocalVideo(true);
    }
  });

  useDailyEvent('error', (event) => {
    setError(event?.errorMsg || 'An error occurred');
  });

  useEffect(() => {
    if (daily && !joined) {
      daily.startCamera({
        startVideoOff: false,
        startAudioOff: false,
      }).then(() => {
        return daily.join({
          userName,
        });
      }).catch((err) => {
        console.error('Failed to join meeting:', err);
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
      {/* Audio for all participants */}
      <DailyAudio />

      {/* Host Control Panel */}
      {isHost && showSettings && (
        <HostControlPanel onClose={() => setShowSettings(false)} />
      )}

      {/* Debug info for host */}
      {isHost && (
        <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-sm rounded-lg p-2 text-[10px] text-white/80 font-mono">
          <div>Audio: {localParticipant?.tracks?.audio?.state || 'none'}</div>
          <div>Video: {localParticipant?.tracks?.video?.state || 'none'}</div>
          <div>Participants: {remoteParticipantIds.length}</div>
        </div>
      )}

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

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <Controls
          onLeave={onLeave}
          isHost={isHost}
          onToggleSettings={() => setShowSettings(!showSettings)}
        />
      </div>
    </div>
  );
}

export function VideoRoom({ roomUrl, userName, onLeave, isHost = false }: VideoRoomProps) {
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Destroy any existing call object first
    destroyCallObject();

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
      <CallUI userName={userName} onLeave={onLeave} isHost={isHost} />
    </DailyProvider>
  );
}
