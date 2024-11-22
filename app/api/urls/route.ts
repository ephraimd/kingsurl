import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { z } from 'zod';

export const dynamic = "force-dynamic";

const urlSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1),
  userId: z.string().min(1),
});

async function checkDbConnection() {
  try {
    await prisma.uRL.count();
    return true;
  } catch (err) {
    return false
  }
}

export async function POST(request: Request) {
  try {

    const isDbGood = await checkDbConnection();

    if (!isDbGood) {
      return new Response(JSON.stringify({ error: 'Database temporrily not available' }), {
        status: 500,
      });
    }

    const referer = request.headers.get('referer');

    if (!referer || !referer.startsWith(process.env?.NEXT_PUBLIC_BASE_URL ?? '')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
      });
    }

    const body = await request.json();
    const { url, title, userId } = urlSchema.parse(body);

    const totalForUser = await prisma.uRL.count({
      where: {
        userId
      }
    });

    if (totalForUser >= 20) {
      return NextResponse.json(
        { error: 'You have exceed allowable number of links to create' },
        { status: 400 }
      );
    }

    const shortUrl = await prisma.uRL.create({
      data: {
        shortId: nanoid(6),
        originalUrl: url,
        title,
        userId,
      },
    });

    return NextResponse.json(shortUrl);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const isDbGood = await checkDbConnection();

    if (!isDbGood) {
      return new Response(JSON.stringify({ error: 'Database temporrily not available' }), {
        status: 500,
      });
    }

    const referer = request.headers.get('referer');

    if (!referer || !referer.startsWith(process.env?.NEXT_PUBLIC_BASE_URL ?? '')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
      });
    }

    const { searchParams } = new URL(request.url);
    const urlId = searchParams.get('urlId');
    if (!urlId) {
      return NextResponse.json(
        { error: 'Missing urlId' },
        { status: 400 }
      );
    }

    const shortUrl = await prisma.uRL.delete({
      where: {
        id: urlId
      }
    });

    return NextResponse.json(shortUrl);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const isDbGood = await checkDbConnection();

    if (!isDbGood) {
      return new Response(JSON.stringify({ error: 'Database temporrily not available' }), {
        status: 500,
      });
    }

    const referer = request.headers.get('referer');

    if (!referer || !referer.startsWith(process.env?.NEXT_PUBLIC_BASE_URL ?? '')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
      });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const urls = await prisma.uRL.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(urls);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to GET' }, { status: 400 });
  }
}