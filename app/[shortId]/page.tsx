import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function RedirectPage({
  params,
}: {
  params: { shortId: string };
}) {
  const url = await prisma.uRL.findFirst({
    where: { shortId: params.shortId },
  });

  if (!url) {
    redirect('/');
  }

  redirect(url.originalUrl);
}