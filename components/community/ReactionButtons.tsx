'use client';

import { useState, useTransition } from 'react';
import { ReactionType, ReactionsCount, REACTION_INFO } from '@/types/community';
import { toggleReaction } from '@/lib/community/actions';

interface ReactionButtonsProps {
  targetType: 'post' | 'comment';
  targetId: string;
  reactionsCount: ReactionsCount;
  userReactions?: ReactionType[];
  size?: 'sm' | 'md';
  className?: string;
}

export default function ReactionButtons({
  targetType,
  targetId,
  reactionsCount,
  userReactions = [],
  size = 'md',
  className = ''
}: ReactionButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const [localReactions, setLocalReactions] = useState<ReactionType[]>(userReactions);
  const [localCounts, setLocalCounts] = useState<ReactionsCount>(reactionsCount);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5'
  };

  const handleReaction = (reactionType: ReactionType) => {
    const hasReaction = localReactions.includes(reactionType);

    // Optimistic update
    if (hasReaction) {
      setLocalReactions(prev => prev.filter(r => r !== reactionType));
      setLocalCounts(prev => ({
        ...prev,
        [reactionType]: Math.max(0, prev[reactionType] - 1)
      }));
    } else {
      setLocalReactions(prev => [...prev, reactionType]);
      setLocalCounts(prev => ({
        ...prev,
        [reactionType]: prev[reactionType] + 1
      }));
    }

    startTransition(async () => {
      const result = await toggleReaction(targetType, targetId, reactionType);
      if (!result.success) {
        // Revert on error
        if (hasReaction) {
          setLocalReactions(prev => [...prev, reactionType]);
          setLocalCounts(prev => ({
            ...prev,
            [reactionType]: prev[reactionType] + 1
          }));
        } else {
          setLocalReactions(prev => prev.filter(r => r !== reactionType));
          setLocalCounts(prev => ({
            ...prev,
            [reactionType]: Math.max(0, prev[reactionType] - 1)
          }));
        }
      }
    });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {(Object.keys(REACTION_INFO) as ReactionType[]).map((type) => {
        const info = REACTION_INFO[type];
        const hasReaction = localReactions.includes(type);
        const count = localCounts[type];

        return (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            disabled={isPending}
            className={`
              ${sizeClasses[size]}
              inline-flex items-center rounded-full font-medium
              transition-all duration-200
              ${hasReaction
                ? type === 'utile'
                  ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                  : type === 'soutien'
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                    : 'bg-teal-100 text-teal-700 border-2 border-teal-300'
                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }
              ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={info.label}
          >
            <span className="text-base">{info.icon}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
