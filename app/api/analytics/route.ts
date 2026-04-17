import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '7d';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
    }

    // First, check if table exists and has any data
    const { count: totalCount, error: countError } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true });

    console.log('Total records in page_views table:', totalCount);
    if (countError) {
      console.error('Error counting page_views:', countError);
    }

    // Fetch analytics data from page_views table
    const { data: pageViews, error } = await supabase
      .from('page_views')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    console.log('Page views query result:', { 
      count: pageViews?.length || 0, 
      error: error?.message,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    if (pageViews && pageViews.length > 0) {
      console.log('Sample page view:', pageViews[0]);
    }

    if (error) throw error;

    // Calculate metrics
    const totalVisitors = pageViews?.length || 0;
    const uniqueSessions = new Set(pageViews?.map(pv => pv.session_id)).size;
    const totalPageViews = pageViews?.length || 0;

    // Group by date for trend
    const visitorTrend: any[] = [];
    const pageViewsByDay: any[] = [];
    const dateMap = new Map();

    pageViews?.forEach((pv: any) => {
      const date = new Date(pv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!dateMap.has(date)) {
        dateMap.set(date, { visitors: 0, pageViews: 0, uniqueSessions: new Set() });
      }
      
      const entry = dateMap.get(date);
      entry.pageViews++;
      entry.uniqueSessions.add(pv.session_id);
    });

    dateMap.forEach((value, date) => {
      visitorTrend.push({
        date,
        visitors: value.uniqueSessions.size,
        pageViews: value.pageViews
      });
      pageViewsByDay.push({
        date,
        views: value.pageViews
      });
    });

    // Group by path for top pages
    const pathMap = new Map();
    pageViews?.forEach((pv: any) => {
      if (!pathMap.has(pv.path)) {
        pathMap.set(pv.path, { views: 0, uniqueVisitors: new Set(), title: pv.page_title || 'Untitled' });
      }
      const entry = pathMap.get(pv.path);
      entry.views++;
      entry.uniqueVisitors.add(pv.session_id);
    });

    const topPages = Array.from(pathMap.entries())
      .map(([path, data]: [string, any]) => ({
        path,
        title: data.title,
        views: data.views,
        uniqueVisitors: data.uniqueVisitors.size
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Calculate traffic sources (mock data for now - in production, track referrer)
    const trafficSources = [
      { name: 'Direct', value: Math.floor(totalVisitors * 0.4) },
      { name: 'Organic Search', value: Math.floor(totalVisitors * 0.3) },
      { name: 'Social', value: Math.floor(totalVisitors * 0.2) },
      { name: 'Referral', value: Math.floor(totalVisitors * 0.1) }
    ];

    // Calculate device breakdown (mock data for now - in production, track user agent)
    const deviceBreakdown = [
      { device: 'Desktop', count: Math.floor(totalVisitors * 0.6) },
      { device: 'Mobile', count: Math.floor(totalVisitors * 0.35) },
      { device: 'Tablet', count: Math.floor(totalVisitors * 0.05) }
    ];

    // Calculate growth (mock - in production, compare with previous period)
    const visitorGrowth = 12.5;
    const pageViewGrowth = 8.3;

    // Calculate average session duration (mock - in production, track time spent)
    const avgSessionDuration = '4m 32s';

    return NextResponse.json({
      success: true,
      data: {
        totalVisitors,
        totalPageViews,
        uniqueVisitors: uniqueSessions,
        avgSessionDuration,
        visitorGrowth,
        pageViewGrowth,
        visitorTrend,
        pageViewsByDay,
        topPages,
        trafficSources,
        deviceBreakdown
      }
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
