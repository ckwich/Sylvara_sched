import { prisma } from '@sylvara/db';

export async function upsertUserOnSignIn(email: string, name: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      role: true,
      active: true,
    },
  });

  if (user) {
    if (!user.active) {
      throw new Error('User account is inactive.');
    }
    return user;
  }

  return prisma.user.create({
    data: {
      email: normalizedEmail,
      name: name.trim() || normalizedEmail,
      role: 'VIEWER',
      active: true,
    },
    select: {
      id: true,
      role: true,
      active: true,
    },
  });
}
