'use client';

import { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/analytics?range=${timeRange}&t=${Date.now()}`, {
        cache: 'no-store'
      });
      const data = await res.json();
      console.log('Analytics API response:', data);
      if (data.success) {
        setAnalyticsData(data.data);
      } else {
        setError(data.error || 'Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to connect to analytics API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="p-8 text-center text-zinc-400 animate-pulse">
        Loading analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-sm p-6">
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Analytics</h3>
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 bg-red-600 text-white px-4 py-2 text-xs uppercase font-bold tracking-widest hover:bg-red-700 transition-colors rounded-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const COLORS = ['#000000', '#71717a', '#a1a1aa', '#d4d4d8', '#e4e4e7'];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-playfair font-medium text-zinc-900">Analytics Dashboard</h2>
          <p className="text-zinc-500 text-sm mt-1">Track your site performance and visitor insights</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-xs uppercase font-bold tracking-widest rounded-sm transition-colors ${
                timeRange === range
                  ? 'bg-black text-white'
                  : 'border border-zinc-200 text-zinc-600 hover:border-black'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-zinc-200 rounded-sm p-6">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Total Visitors</p>
          <p className="text-3xl font-bold text-zinc-900">{analyticsData?.totalVisitors || 0}</p>
          <p className="text-xs text-green-600 mt-2">
            {analyticsData?.visitorGrowth >= 0 ? '+' : ''}{analyticsData?.visitorGrowth || 0}% from last period
          </p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-sm p-6">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Page Views</p>
          <p className="text-3xl font-bold text-zinc-900">{analyticsData?.totalPageViews || 0}</p>
          <p className="text-xs text-green-600 mt-2">
            {analyticsData?.pageViewGrowth >= 0 ? '+' : ''}{analyticsData?.pageViewGrowth || 0}% from last period
          </p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-sm p-6">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Unique Visitors</p>
          <p className="text-3xl font-bold text-zinc-900">{analyticsData?.uniqueVisitors || 0}</p>
          <p className="text-xs text-zinc-500 mt-2">Based on session tracking</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-sm p-6">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Avg. Session Duration</p>
          <p className="text-3xl font-bold text-zinc-900">{analyticsData?.avgSessionDuration || '0m 0s'}</p>
          <p className="text-xs text-zinc-500 mt-2">Time on site</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Visitor Trend Line Chart */}
        <div className="bg-white border border-zinc-200 rounded-sm p-6">
          <h3 className="text-lg font-medium mb-4">Visitor Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData?.visitorTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis 
                dataKey="date" 
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e4e4e7',
                  borderRadius: '4px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="visitors" 
                stroke="#000" 
                strokeWidth={2}
                name="Visitors"
              />
              <Line 
                type="monotone" 
                dataKey="pageViews" 
                stroke="#71717a" 
                strokeWidth={2}
                name="Page Views"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Page Views Bar Chart */}
        <div className="bg-white border border-zinc-200 rounded-sm p-6">
          <h3 className="text-lg font-medium mb-4">Page Views by Day</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData?.pageViewsByDay || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis 
                dataKey="date" 
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e4e4e7',
                  borderRadius: '4px'
                }}
              />
              <Legend />
              <Bar dataKey="views" fill="#000" name="Page Views" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white border border-zinc-200 rounded-sm p-6 mb-8">
        <h3 className="text-lg font-medium mb-4">Top Pages</h3>
        <div className="space-y-3">
          {analyticsData?.topPages?.slice(0, 5).map((page: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-zinc-50 rounded-sm">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-zinc-400 w-6">#{index + 1}</span>
                <div>
                  <p className="text-sm font-medium text-zinc-900">{page.path}</p>
                  <p className="text-xs text-zinc-500">{page.title}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-zinc-900">{page.views} views</p>
                <p className="text-xs text-zinc-500">{page.uniqueVisitors} unique</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources Pie Chart */}
        <div className="bg-white border border-zinc-200 rounded-sm p-6">
          <h3 className="text-lg font-medium mb-4">Traffic Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData?.trafficSources || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(analyticsData?.trafficSources || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white border border-zinc-200 rounded-sm p-6">
          <h3 className="text-lg font-medium mb-4">Device Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData?.deviceBreakdown || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis 
                type="number"
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                type="category"
                dataKey="device"
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e4e4e7',
                  borderRadius: '4px'
                }}
              />
              <Bar dataKey="count" fill="#000" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
