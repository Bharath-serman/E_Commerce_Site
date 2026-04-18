import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, page_title, referrer, user_agent, session_id } = body;

    if (!path || !session_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get IP address from request
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    console.log('Tracking page view:', { path, page_title, session_id, ip });

    // Insert page view record
    const { data, error } = await supabase
      .from('page_views')
      .insert({
        session_id,
        path,
        page_title: page_title || null,
        referrer: referrer || null,
        user_agent: user_agent || null,
        ip_address: ip
      })
      .select();

    if (error) {
      console.error('Error inserting page view:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('Page view tracked successfully. Inserted data:', data);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Track API error:', error);
    // Don't fail the request if tracking fails
    return NextResponse.json({ success: true });
  }
}
