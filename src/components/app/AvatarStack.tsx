import { useState } from "react";
import { usePresence } from "../../hooks/usePresence";
import { PhoneCall } from "lucide-react";
import HuddleRoom from "./HuddleRoom";

interface AvatarStackProps {
  roomName: string;
  maxDisplay?: number;
}

export default function AvatarStack({
  roomName,
  maxDisplay = 4,
}: AvatarStackProps) {
  const { activeUsers } = usePresence(roomName);
  const [isHuddleActive, setIsHuddleActive] = useState(false);

  if (!activeUsers || activeUsers.length === 0) return null;

  const displayUsers = activeUsers.slice(0, maxDisplay);
  const remainingCount = Math.max(0, activeUsers.length - maxDisplay);

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2 overflow-hidden">
        {displayUsers.map((user) => (
          <div
            key={user.id}
            title={`${user.full_name} (Active)`}
            className="relative inline-block h-8 w-8 rounded-full border-2 border-slate-900 bg-indigo-500/20 flex items-center justify-center text-xs font-medium text-indigo-300 ring-2 ring-transparent group hover:z-10 transition-all hover:-translate-y-1 hover:ring-indigo-500/50"
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              user.full_name?.charAt(0).toUpperCase() ||
              user.email?.charAt(0).toUpperCase()
            )}

            {/* Online Indicator Dot */}
            <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-slate-900 shadow-sm" />
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-800 text-xs font-medium text-slate-300 z-0">
            +{remainingCount}
          </div>
        )}
      </div>

      {activeUsers.length > 0 && (
        <span className="ml-3 text-xs font-medium text-slate-400 animate-pulse flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          {activeUsers.length} viewing natively
        </span>
      )}

      {activeUsers.length > 1 && !isHuddleActive && (
        <button
          onClick={() => setIsHuddleActive(true)}
          className="ml-4 flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500/20 to-[#10B981]/20 hover:from-indigo-500/30 hover:to-[#10B981]/30 border border-indigo-500/30 rounded-lg text-emerald-400 text-xs font-medium transition-all hover:scale-105 shadow-lg shadow-emerald-500/10"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Start Huddle</span>
        </button>
      )}

      {isHuddleActive && (
        <HuddleRoom
          roomName={roomName}
          onClose={() => setIsHuddleActive(false)}
        />
      )}
    </div>
  );
}
