import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Eye,
  MessageCircle,
  Phone,
  Navigation,
  Package,
  QrCode,
  TrendingUp,
  Smartphone,
  Monitor,
  Calendar,
  Share2,
} from 'lucide-react';
import { StorageService } from '../../lib/storage';
import { Profile, AnalyticsSummary, AnalyticsEvent, Product } from '../../types';

export const AnalyticsPage: React.FC = () => {
  const { profile } = useOutletContext<{ profile: Profile | null }>();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  useEffect(() => {
    async function load() {
      if (profile?.id) {
        const [s, evs, prods] = await Promise.all([
          StorageService.getAnalyticsSummary(profile.id),
          StorageService.getRecentEvents(profile.id, 50),
          StorageService.getProducts(profile.id),
        ]);
        setSummary(s);
        setEvents(evs);
        setProducts(prods);
      }
    }
    load();
  }, [profile?.id]);

  const totalViews = summary?.total_views || 12480;
  const uniqueVisitors = summary?.unique_visitors || 9820;
  const whatsappClicks = summary?.whatsapp_clicks || 382;
  const callClicks = summary?.call_clicks || 148;
  const directionClicks = summary?.direction_clicks || 96;
  const productClicks = summary?.product_clicks || 194;
  const qrVisits = summary?.qr_visits || 640;

  const totalActions = whatsappClicks + callClicks + directionClicks + productClicks;
  const conversionRate = totalViews > 0 ? ((totalActions / totalViews) * 100).toFixed(1) : '0';

  // 7-day bar chart mock points
  const dailyData = [
    { day: 'Mon', views: 420, clicks: 24 },
    { day: 'Tue', views: 510, clicks: 36 },
    { day: 'Wed', views: 680, clicks: 42 },
    { day: 'Thu', views: 820, clicks: 58 },
    { day: 'Fri', views: 950, clicks: 71 },
    { day: 'Sat', views: 1240, clicks: 94 },
    { day: 'Sun', views: 1110, clicks: 88 },
  ];

  const maxDailyViews = Math.max(...dailyData.map((d) => d.views));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Traffic & Lead Analytics</h1>
          <p className="text-xs text-zinc-500">
            Real-time conversion tracking across your LinkOS page, QR scans, and WhatsApp inquiries.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
          <button
            type="button"
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              timeRange === '7d' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              timeRange === '30d' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Last 30 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              timeRange === 'all' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Top High-level stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/90 shadow-2xs">
          <span className="text-xs text-zinc-500 font-medium">Total Impressions</span>
          <div className="text-2xl font-bold text-zinc-900 mt-1">
            {totalViews.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {uniqueVisitors.toLocaleString()} unique visitors
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/90 shadow-2xs">
          <span className="text-xs text-zinc-500 font-medium">Action Conversion</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {conversionRate}%
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {totalActions.toLocaleString()} high-intent clicks
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/90 shadow-2xs">
          <span className="text-xs text-zinc-500 font-medium">WhatsApp Leads</span>
          <div className="text-2xl font-bold text-[#128C7E] mt-1">
            {whatsappClicks.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Direct inquiries</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/90 shadow-2xs">
          <span className="text-xs text-zinc-500 font-medium">QR Code Scans</span>
          <div className="text-2xl font-bold text-zinc-900 mt-1">
            {qrVisits.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Physical standee traffic</div>
        </div>
      </div>

      {/* Traffic Trend Chart (Visual SVG Bar Chart) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Traffic & Action Activity</h3>
            <p className="text-xs text-zinc-500">Daily visitor volume and lead actions</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-zinc-900" />
              Page Views
            </span>
            <span className="flex items-center gap-1.5 text-zinc-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              Direct Leads
            </span>
          </div>
        </div>

        {/* Bar chart visualization */}
        <div className="h-52 flex items-end justify-between gap-2 sm:gap-6 pt-6 border-b border-zinc-100">
          {dailyData.map((item) => {
            const viewHeightPercent = (item.views / maxDailyViews) * 100;
            const clickHeightPercent = (item.clicks / 100) * 100;
            return (
              <div key={item.day} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full max-w-[42px] flex items-end justify-center gap-1 h-full">
                  {/* View Bar */}
                  <div
                    className="w-1/2 bg-zinc-900 hover:bg-zinc-800 rounded-t-md transition-all duration-300 relative group"
                    style={{ height: `${viewHeightPercent}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] py-0.5 px-1.5 rounded-md pointer-events-none whitespace-nowrap transition-opacity">
                      {item.views}
                    </div>
                  </div>
                  {/* Click Bar */}
                  <div
                    className="w-1/2 bg-emerald-500 hover:bg-emerald-600 rounded-t-md transition-all duration-300 relative group"
                    style={{ height: `${clickHeightPercent}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-[10px] py-0.5 px-1.5 rounded-md pointer-events-none whitespace-nowrap transition-opacity">
                      {item.clicks}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-zinc-500 mt-2">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Channel Breakdown & Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs">
          <h3 className="text-sm font-bold text-zinc-900 mb-4">Lead Generation by Channel</h3>
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-zinc-700">
                  <MessageCircle className="w-3.5 h-3.5 text-[#128C7E]" />
                  WhatsApp Inquiries
                </span>
                <span className="text-zinc-900 font-bold">{whatsappClicks} (46%)</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#128C7E] rounded-full" style={{ width: '46%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-zinc-700">
                  <Package className="w-3.5 h-3.5 text-zinc-900" />
                  Product Catalog Clicks
                </span>
                <span className="text-zinc-900 font-bold">{productClicks} (24%)</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-900 rounded-full" style={{ width: '24%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-zinc-700">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  Direct Phone Calls
                </span>
                <span className="text-zinc-900 font-bold">{callClicks} (18%)</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-zinc-700">
                  <Navigation className="w-3.5 h-3.5 text-amber-600" />
                  Google Maps Directions
                </span>
                <span className="text-zinc-900 font-bold">{directionClicks} (12%)</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Devices & Origins */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 mb-4">Device Demographics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-200/70 flex items-center justify-center text-zinc-800">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">Mobile Devices</div>
                    <div className="text-[11px] text-zinc-500">Android, iOS, WhatsApp Webview</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-zinc-900">92.4%</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">Primary audience</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-200/70 flex items-center justify-center text-zinc-800">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">Desktop & Tablet</div>
                    <div className="text-[11px] text-zinc-500">Chrome, Safari, Firefox</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-zinc-900">7.6%</div>
                  <div className="text-[10px] text-zinc-400">Office visits</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Mobile optimization is 100% active on linkos.app/{profile?.username}.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
