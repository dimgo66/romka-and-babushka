import { NextResponse } from 'next/server';

import { deleteLead, getLead, updateLead } from '@/lib/store';
import { isAuthenticated } from '@/lib/auth';
import { validateStatus } from '@/lib/validation';
import { LIMITS } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/leads/[id] — смена статуса и заметок менеджера (только CRM) */
export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalidJson' }, { status: 400 });
  }

  const patch: { status?: ReturnType<typeof validateStatus> & string; notes?: string | null } = {};

  if ('status' in body) {
    const status = validateStatus(body.status);
    if (!status) return NextResponse.json({ ok: false, error: 'invalidStatus' }, { status: 400 });
    patch.status = status;
  }

  if ('notes' in body) {
    const notes = typeof body.notes === 'string' ? body.notes.trim() : '';
    if (notes.length > LIMITS.notes) {
      return NextResponse.json({ ok: false, error: 'notesTooLong' }, { status: 400 });
    }
    patch.notes = notes || null;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: 'nothingToUpdate' }, { status: 400 });
  }

  const updated = await updateLead(id, patch);
  if (!updated) return NextResponse.json({ ok: false, error: 'notFound' }, { status: 404 });

  return NextResponse.json({ ok: true, lead: updated });
}

/** GET /api/leads/[id] */
export async function GET(_request: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) return NextResponse.json({ ok: false, error: 'notFound' }, { status: 404 });
  return NextResponse.json({ ok: true, lead });
}

/** DELETE /api/leads/[id] */
export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const removed = await deleteLead(id);
  if (!removed) return NextResponse.json({ ok: false, error: 'notFound' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
