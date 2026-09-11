import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { Editor } from '@/components/editor/Editor';
import { getProjectsForUser } from '@/lib/projects';

export default async function EditorPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();

  const email = user?.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error('Authenticated user does not have an email address');
  }

  const { owned, shared } = await getProjectsForUser(userId, email);

  return <Editor initialOwnedProjects={owned} initialSharedProjects={shared} />;
}
