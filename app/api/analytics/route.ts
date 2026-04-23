import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

    // Reset times to UTC midnight to avoid timezone issues
    endDate.setUTCHours(23, 59, 59, 999);
    startDate.setUTCHours(0, 0, 0, 0);

    // Fetch analytics data from page_views table
    const { data: pageViews, error } = await supabase
      .from('page_views')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

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

    // Calculate traffic sources from referrer data
    const sourceMap = new Map();
    pageViews?.forEach((pv: any) => {
      let source = 'Direct';
      if (pv.referrer) {
        const referrer = pv.referrer.toLowerCase();
        if (referrer.includes('google') || referrer.includes('bing') || referrer.includes('yahoo') || referrer.includes('duckduckgo')) {
          source = 'Organic Search';
        } else if (referrer.includes('facebook') || referrer.includes('twitter') || referrer.includes('linkedin') || referrer.includes('instagram')) {
          source = 'Social';
        } else {
          source = 'Referral';
        }
      }
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    });

    const trafficSources = Array.from(sourceMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Calculate device breakdown from user_agent data
    const deviceMap = new Map();
    pageViews?.forEach((pv: any) => {
      let device = 'Desktop';
      const userAgent = pv.user_agent?.toLowerCase() || '';
      if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
        device = 'Mobile';
      } else if (userAgent.includes('ipad') || userAgent.includes('tablet')) {
        device = 'Tablet';
      }
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
    });

    const deviceBreakdown = Array.from(deviceMap.entries())
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate growth by comparing with previous period
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(startDate);
    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    previousStartDate.setDate(previousStartDate.getDate() - daysDiff);

    const { data: previousPageViews } = await supabase
      .from('page_views')
      .select('*')
      .gte('created_at', previousStartDate.toISOString())
      .lte('created_at', previousEndDate.toISOString());

    const previousTotalVisitors = previousPageViews?.length || 0;
    const previousPageViewCount = previousPageViews?.length || 0;

    const visitorGrowth = previousTotalVisitors > 0 
      ? ((totalVisitors - previousTotalVisitors) / previousTotalVisitors) * 100 
      : 0;
    const pageViewGrowth = previousPageViewCount > 0 
      ? ((totalPageViews - previousPageViewCount) / previousPageViewCount) * 100 
      : 0;

    // Calculate average session duration based on time between page views per session
    const sessionMap = new Map<string, Date[]>();
    pageViews?.forEach((pv: any) => {
      if (!sessionMap.has(pv.session_id)) {
        sessionMap.set(pv.session_id, []);
      }
      sessionMap.get(pv.session_id)?.push(new Date(pv.created_at));
    });

    let totalDuration = 0;
    sessionMap.forEach((timestamps) => {
      if (timestamps.length > 1) {
        const duration = timestamps[timestamps.length - 1].getTime() - timestamps[0].getTime();
        totalDuration += duration;
      }
    });

    const avgDurationMs = sessionMap.size > 0 ? totalDuration / sessionMap.size : 0;
    const avgMinutes = Math.floor(avgDurationMs / (1000 * 60));
    const avgSeconds = Math.floor((avgDurationMs % (1000 * 60)) / 1000);
    const avgSessionDuration = `${avgMinutes}m ${avgSeconds}s`;

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
