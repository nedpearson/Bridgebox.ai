import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface PresenceUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  last_seen: string;
}

export function usePresence(roomName: string) {
  const { user, profile } = useAuth();
  const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!user || !profile) return;

    // Create a Supabase channel dedicated to this specific room (e.g., document:123)
    const channel = supabase.channel(`presence:${roomName}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Handle updates to the presence state
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      
      const users: PresenceUser[] = [];
      // Extract the unique users currently present in the channel
      for (const [key, presences] of Object.entries(state)) {
        const pArray = presences as any[];
        if (pArray.length > 0) {
          const presence = pArray[0]; // Take the most recent presence of this key
          users.push({
            id: key,
            email: presence.email,
            full_name: presence.full_name,
            avatar_url: presence.avatar_url,
            last_seen: presence.online_at,
          });
        }
      }
      setActiveUsers(users);
    });

    // Subscribe and track this user natively
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const payload = {
          email: user.email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          online_at: new Date().toISOString(),
        };
        await channel.track(payload);
      }
    });

    // Cleanup: untrack and unsubscribe on unmount
    return () => {
      channel.untrack().then(() => {
        supabase.removeChannel(channel);
      });
    };
  }, [roomName, user, profile]);

  return { activeUsers };
}
