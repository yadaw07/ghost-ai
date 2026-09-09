import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { Editor } from '@/components/editor/Editor';

export default async function EditorPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return <Editor />;
}
