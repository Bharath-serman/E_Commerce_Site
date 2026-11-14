import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message, contact_method, contactMethod } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: 'Name, email, subject, and message are required' }, { status: 400 });
    }

    const method = (contact_method || contactMethod || 'email');
    const validMethod = ['email', 'phone', 'both'].includes(method) ? method : 'email';

    // Direct SQL insert - 100% immune to RLS restrictions
    try {
      const rows = await sql`
        INSERT INTO support_requests (name, email, phone, subject, message, contact_method, status)
        VALUES (${name}, ${email}, ${phone || null}, ${subject}, ${message}, ${validMethod}, 'pending')
        RETURNING *
      `;
      if (rows && rows.length > 0) {
        return NextResponse.json({ success: true, data: rows[0] });
      }
    } catch (sqlErr: any) {
      console.warn('Direct SQL insert failed, trying getSupabaseAdmin fallback:', sqlErr);
    }

    const supportData = {
      name,
      email,
      phone: phone || null,
      subject,
      message,
      contact_method: validMethod as 'email' | 'phone' | 'both',
      status: 'pending' as const
    };

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('support_requests')
      .insert(supportData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Support request creation error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    try {
      const rows = await sql`
        SELECT * FROM support_requests
        ORDER BY created_at DESC
      `;
      return NextResponse.json({ success: true, data: rows || [] });
    } catch (sqlErr) {
      console.warn('Direct SQL query failed, falling back to Supabase:', sqlErr);
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('support_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
