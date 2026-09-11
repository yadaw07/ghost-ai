import { prisma } from '@/lib/prisma';

function generateSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function getProjectsForUser(userId: string, email: string) {
  const owned = await prisma.project.findMany({
    where: {
      ownerId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const shared = await prisma.project.findMany({
    where: {
      collaborators: {
        some: {
          email,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    owned: owned.map((project) => ({
      id: project.id,
      name: project.name,
      slug: generateSlug(project.name),
      owned: true,
    })),

    shared: shared.map((project) => ({
      id: project.id,
      name: project.name,
      slug: generateSlug(project.name),
      owned: false,
    })),
  };
}
