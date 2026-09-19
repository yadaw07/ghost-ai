import { auth, currentUser } from '@clerk/nextjs/server';

import { getCursorColor, getLiveblocksClient } from '@/lib/liveblocks';
import { checkProjectAccess } from '@/lib/project-access';

interface LiveblocksAuthRequest {
  room?: unknown;
}

function isLiveblocksAuthRequest(
  value: unknown,
): value is LiveblocksAuthRequest {
  return typeof value === 'object' && value !== null;
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (
    !isLiveblocksAuthRequest(payload) ||
    typeof payload.room !== 'string' ||
    payload.room.length === 0
  ) {
    return Response.json(
      { error: 'A project room ID is required' },
      { status: 400 },
    );
  }

  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? null;
  const hasProjectAccess = await checkProjectAccess(
    userId,
    primaryEmail,
    payload.room,
  );

  if (!hasProjectAccess) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.username ||
    primaryEmail ||
    'Anonymous user';

  const color = getCursorColor(userId);
  const liveblocks = getLiveblocksClient();

  await liveblocks.upsertRoom(payload.room, {
    update: {
      usersAccesses: {
        [userId]: ['room:write'],
      },
    },
    create: {
      defaultAccesses: [],
      usersAccesses: {
        [userId]: ['room:write'],
      },
    },
  });

  const { status, body } = await liveblocks.identifyUser(
    { userId, groupIds: [] },
    {
      userInfo: {
        name,
        avatar: user?.imageUrl ?? '',
        color,
      },
    },
  );

  return new Response(body, { status });
}
