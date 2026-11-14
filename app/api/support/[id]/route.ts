import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { status } = await req.json();

    if (!status || !['pending', 'in-progress', 'resolved'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    try {
      const rows = await sql`
        UPDATE support_requests
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${resolvedParams.id}
        RETURNING *
      `;
      if (rows && rows.length > 0) {
        return NextResponse.json({ success: true, data: rows[0] });
      }
    } catch (sqlErr) {
      console.warn('Direct SQL patch failed, trying Supabase fallback:', sqlErr);
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('support_requests')
      .update({ status })
      .eq('id', resolvedParams.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Support request update error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;

    try {
      await sql`
        DELETE FROM support_requests
        WHERE id = ${resolvedParams.id}
      `;
      return NextResponse.json({ success: true });
    } catch (sqlErr) {
      console.warn('Direct SQL delete failed, trying Supabase fallback:', sqlErr);
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('support_requests')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Support request delete error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
