'use client';

import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';

import { useOthers } from '@liveblocks/react';

const AVATAR_SIZE = 'h-8 w-8';

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'
  );
}

export function CollaboratorAvatars() {
  const { user } = useUser();
  const others = useOthers();

  const currentUserId = user?.id ?? null;

  const collaborators = others.filter(
    (other) => other.id !== currentUserId,
  );

  const visibleCollaborators = collaborators.slice(0, 5);
  const overflowCount = Math.max(collaborators.length - 5, 0);

  return (
    <div className="absolute right-4 top-4 z-20 flex items-center">
      {collaborators.length > 0 && (
        <div className="flex items-center pr-3">
          <div className="flex items-center">
            {visibleCollaborators.map((collaborator, index) => {
              const name = collaborator.info?.name || 'Anonymous';
              const avatar = collaborator.info?.avatar;

              return (
                <div
                  key={collaborator.connectionId}
                  className="relative"
                  style={{
                    marginLeft: index === 0 ? 0 : -8,
                  }}
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name}
                      className={`${AVATAR_SIZE} rounded-full object-cover ring-2 ring-base`}
                    />
                  ) : (
                    <div
                      className={`${AVATAR_SIZE} flex items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-base`}
                      style={{
                        backgroundColor:
                          collaborator.info?.color ?? '#6366f1',
                      }}
                    >
                      {getInitials(name)}
                    </div>
                  )}
                </div>
              );
            })}

            {overflowCount > 0 && (
              <div
                className={`${AVATAR_SIZE} -ml-2 flex items-center justify-center rounded-full bg-surface text-xs font-medium text-foreground ring-2 ring-base`}
              >
                +{overflowCount}
              </div>
            )}
          </div>
        </div>
      )}

      {collaborators.length > 0 && (
        <div className="mr-3 h-6 w-px bg-border-subtle" />
      )}

      <UserButton
        appearance={{
          elements: {
            avatarBox: 'h-8 w-8',
          },
        }}
      />
    </div>
  );
}