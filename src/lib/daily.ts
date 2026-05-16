const DAILY_API_URL = 'https://api.daily.co/v1';

interface DailyRoom {
  id: string;
  name: string;
  url: string;
  created_at: string;
  config: {
    exp?: number;
    nbf?: number;
    max_participants?: number;
    enable_chat?: boolean;
    enable_knocking?: boolean;
    start_video_off?: boolean;
    start_audio_off?: boolean;
  };
}

interface CreateRoomOptions {
  name?: string;
  expiryMinutes?: number;
  maxParticipants?: number;
}

export async function createDailyRoom(options: CreateRoomOptions = {}): Promise<DailyRoom> {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) {
    throw new Error('DAILY_API_KEY is not configured');
  }

  // Room expires after the session (default 2 hours from now)
  const expiryMinutes = options.expiryMinutes || 120;
  const exp = Math.floor(Date.now() / 1000) + expiryMinutes * 60;

  const response = await fetch(`${DAILY_API_URL}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name: options.name,
      properties: {
        exp,
        max_participants: options.maxParticipants || 4,
        enable_chat: true,
        enable_knocking: false,
        start_video_off: false,
        start_audio_off: false,
        enable_screenshare: false,
        enable_recording: false,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Daily.co API error:', error);
    throw new Error(error.info || 'Failed to create room');
  }

  return response.json();
}

export async function getDailyRoom(roomName: string): Promise<DailyRoom | null> {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) {
    throw new Error('DAILY_API_KEY is not configured');
  }

  const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.info || 'Failed to get room');
  }

  return response.json();
}

export async function deleteDailyRoom(roomName: string): Promise<void> {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) {
    throw new Error('DAILY_API_KEY is not configured');
  }

  const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const error = await response.json();
    throw new Error(error.info || 'Failed to delete room');
  }
}

// Generate a unique room name based on access code
export function generateRoomName(accessCode: string): string {
  return `session-${accessCode.toLowerCase()}`;
}
