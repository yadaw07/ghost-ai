import { redirect } from 'next/navigation';
import {
  getCurrentClerkIdentity,
  checkProjectAccess,
  getProjectById,
} from '@/lib/project-access';
import { AccessDenied } from '@/components/editor/access-denied';
import { getProjectsForUser } from '@/lib/projects';
import { WorkspaceClient } from './WorkspaceClient';

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  const { userId, primaryEmail } = await getCurrentClerkIdentity();

  if (!userId) {
    redirect('/sign-in');
  }

  const hasAccess = await checkProjectAccess(
    userId,
    primaryEmail ?? '',
    roomId,
  );

  if (!hasAccess) {
    return <AccessDenied />;
  }

  const project = await getProjectById(roomId);

  if (!project) {
    return <AccessDenied />;
  }

  const { owned, shared } = await getProjectsForUser(
    userId,
    primaryEmail ?? '',
  );

  const projects = [...owned, ...shared];

  return (
    <WorkspaceClient
      projectName={project.name}
      roomId={roomId}
      projects={projects}
      activeProjectId={project.id}
    />
  );
}
