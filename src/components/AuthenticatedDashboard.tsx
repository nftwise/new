'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { 
  DollarSign, 
  Phone, 
  Users, 
  TrendingUp, 
  MousePointer,
  Clock,
  Target,
  PhoneCall,
  LogOut,
  Building2,
  PhoneIncoming,
  PhoneOff,
  Timer,
  Activity,
} from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { ChartContainer } from '@/components/ChartContainer';
import { TimeRangeSelector } from '@/components/TimeRangeSelector';
import { DataTable } from '@/components/DataTable';
import { GoogleAnalyticsSection } from '@/components/GoogleAnalyticsSection';
import { GoogleAdsSection } from '@/components/GoogleAdsSection';
import { TrendsInsightsSection } from '@/components/TrendsInsightsSection';
import { DashboardMetrics } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ExportButton } from '@/components/ExportButton';
import { EmailReportButton } from '@/components/EmailReportButton';

export default function AuthenticatedDashboard() {
  const { data: session } = useSession();
  const [period, setPeriod] = useState('7days');
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchDashboardData();
    }
  }, [period, session]);

  useEffect(() => {
    if (!session?.user) return;
    
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [period, session]);

  const fetchDashboardData = async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard?period=${period}&clientId=${session.user.id}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header with Company Info and Logout */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {session?.user?.companyName}
              </h1>
              <p className="text-gray-600 mt-1">
                Your comprehensive marketing analytics dashboard
              </p>
              {lastUpdated && (
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <TimeRangeSelector
              selectedPeriod={period}
              onPeriodChange={setPeriod}
            />
            {data && (
              <>
                <ExportButton
                  data={{
                    companyName: session?.user?.companyName,
                    period,
                    ...data,
                  }}
                />
                <EmailReportButton
                  dashboardData={data}
                  period={period}
                />
              </>
            )}
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Google Analytics Section - Top Priority */}
        <GoogleAnalyticsSection period={period} />

        {/* Google Ads Section - Only show if client has ads data */}
        <GoogleAdsSection period={period} clientId={session?.user?.id} />

        {/* Trends & Insights Section */}
        <TrendsInsightsSection period={period} clientId={session?.user?.id} />

        {/* Cross-Platform Summary Metrics */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-green-500 rounded"></div>
            Cross-Platform Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Sessions"
              value={data?.googleAnalytics.metrics.sessions || 0}
              format="number"
              icon={Users}
              description="from Google Analytics"
            />
            <MetricCard
              title="Ad Spend"
              value={data?.googleAds.totalMetrics.cost || 0}
              format="currency"
              icon={DollarSign}
              description="Google Ads"
            />
            <MetricCard
              title="Phone Calls"
              value={data?.callRail.metrics.totalCalls || 0}
              format="number"
              icon={Phone}
              description="from CallRail"
            />
            <MetricCard
              title="Total Conversions"
              value={data?.combined.totalConversions || 0}
              format="number"
              icon={Target}
              description="all sources"
            />
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded"></div>
            Performance & Cost Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Cost Per Click"
              value={data?.googleAds.totalMetrics.cpc || 0}
              format="currency"
              icon={MousePointer}
              description="Google Ads CPC"
            />
            <MetricCard
              title="Cost Per Lead"
              value={data?.combined.overallCostPerLead || 0}
              format="currency"
              icon={TrendingUp}
              description="across all channels"
            />
            <MetricCard
              title="Call Duration"
              value={data?.callRail.metrics.averageDuration || 0}
              format="duration"
              icon={Clock}
              description="average call time"
            />
            <MetricCard
              title="Call Conversion Rate"
              value={data?.callRail.metrics.conversionRate || 0}
              format="percentage"
              icon={PhoneCall}
              description="calls to leads"
            />
          </div>
        </div>

        {/* CallRail Detailed Section */}
        <CallRailDetailedSection period={period} loading={loading} clientId={session?.user?.id} />

        {/* Analytics Charts */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded"></div>
            Trends & Performance Charts
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <GoogleAdsChart period={period} loading={loading} clientId={session?.user?.id} />
            <CallRailChart period={period} loading={loading} clientId={session?.user?.id} />
          </div>
        </div>

        {/* Detailed Reports */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded"></div>
            Detailed Campaign & Call Reports
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <GoogleAdsCampaignTable period={period} loading={loading} clientId={session?.user?.id} />
            <CallsBySourceTable period={period} loading={loading} clientId={session?.user?.id} />
          </div>
        </div>

        {/* Traffic Source Analysis */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-teal-500 rounded"></div>
            Traffic Source Analysis
          </h2>
          <TrafficSourcesTable period={period} loading={loading} clientId={session?.user?.id} />
        </div>
      </div>
    </div>
  );
}

// Updated chart and table components to accept clientId
function GoogleAdsChart({ period, loading, clientId }: { period: string; loading: boolean; clientId?: string }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (clientId) {
      fetchGoogleAdsChart();
    }
  }, [period, clientId]);

  const fetchGoogleAdsChart = async () => {
    try {
      const response = await fetch(`/api/google-ads?period=${period}&report=cost-per-lead&clientId=${clientId}`);
      const result = await response.json();
      
      if (result.success) {
        const chartData = result.data.map((item: any) => ({
          date: item.date,
          cost: item.cost,
          conversions: item.conversions,
          costPerLead: item.costPerLead,
        }));
        setData(chartData);
      }
    } catch (error) {
      console.error('Failed to fetch Google Ads chart data:', error);
    }
  };

  return (
    <ChartContainer
      title="Google Ads: Cost vs Conversions"
      data={data}
      type="area"
      dataKey="cost"
      xAxisKey="date"
      color="#3b82f6"
      loading={loading}
      yAxisLabel="Cost ($)"
      formatValue={(value) => formatCurrency(value)}
    />
  );
}

function CallRailChart({ period, loading, clientId }: { period: string; loading: boolean; clientId?: string }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (clientId) {
      fetchCallRailChart();
    }
  }, [period, clientId]);

  const fetchCallRailChart = async () => {
    try {
      const response = await fetch(`/api/callrail?period=${period}&report=by-day&clientId=${clientId}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch CallRail chart data:', error);
    }
  };

  return (
    <ChartContainer
      title="Daily Phone Calls"
      data={data}
      type="bar"
      dataKey="totalCalls"
      xAxisKey="date"
      color="#10b981"
      loading={loading}
      yAxisLabel="Calls"
      formatValue={(value) => formatNumber(value)}
    />
  );
}

function GoogleAdsCampaignTable({ period, loading, clientId }: { period: string; loading: boolean; clientId?: string }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (clientId) {
      fetchCampaigns();
    }
  }, [period, clientId]);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`/api/google-ads?period=${period}&report=campaigns&clientId=${clientId}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data.campaigns || []);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns data:', error);
    }
  };

  const columns = [
    { key: 'name', label: 'Campaign', format: 'none' as const },
    { key: 'cost', label: 'Cost', format: 'currency' as const, align: 'right' as const },
    { key: 'clicks', label: 'Clicks', format: 'number' as const, align: 'right' as const },
    { key: 'conversions', label: 'Conversions', format: 'number' as const, align: 'right' as const },
    { key: 'cpc', label: 'CPC', format: 'currency' as const, align: 'right' as const },
    { key: 'costPerConversion', label: 'Cost/Lead', format: 'currency' as const, align: 'right' as const },
  ];

  return (
    <DataTable
      title="Top Google Ads Campaigns"
      data={data.map((campaign: any) => ({
        name: campaign.name,
        cost: campaign.metrics.cost,
        clicks: campaign.metrics.clicks,
        conversions: campaign.metrics.conversions,
        cpc: campaign.metrics.cpc,
        costPerConversion: campaign.metrics.costPerConversion,
      }))}
      columns={columns}
      loading={loading}
    />
  );
}

function CallsBySourceTable({ period, loading, clientId }: { period: string; loading: boolean; clientId?: string }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (clientId) {
      fetchCallsBySource();
    }
  }, [period, clientId]);

  const fetchCallsBySource = async () => {
    try {
      const response = await fetch(`/api/callrail?period=${period}&report=by-source&clientId=${clientId}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch calls by source data:', error);
    }
  };

  const columns = [
    { key: 'source', label: 'Source', format: 'none' as const },
    { key: 'totalCalls', label: 'Total Calls', format: 'number' as const, align: 'right' as const },
    { key: 'answeredCalls', label: 'Answered', format: 'number' as const, align: 'right' as const },
    { key: 'conversions', label: 'Conversions', format: 'number' as const, align: 'right' as const },
  ];

  return (
    <DataTable
      title="Calls by Source"
      data={data}
      columns={columns}
      loading={loading}
    />
  );
}

function CallRailDetailedSection({ period, loading, clientId }: { period: string; loading: boolean; clientId?: string }) {
  const [callData, setCallData] = useState<any>(null);
  const [calls, setCalls] = useState([]);
  const [trackingNumbers, setTrackingNumbers] = useState([]);

  useEffect(() => {
    if (clientId) {
      fetchCallRailData();
      fetchCallsList();
      fetchTrackingNumbers();
    }
  }, [period, clientId]);

  const fetchCallRailData = async () => {
    try {
      const response = await fetch(`/api/callrail?period=${period}&report=overview&clientId=${clientId}`);
      const result = await response.json();
      
      if (result.success) {
        setCallData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch CallRail overview:', error);
    }
  };

  const fetchCallsList = async () => {
    try {
      const response = await fetch(`/api/callrail?period=${period}&report=calls-list&clientId=${clientId}`);
      const result = await response.json();
      
      if (result.success) {
        setCalls(result.data.calls || []);
      }
    } catch (error) {
      console.error('Failed to fetch calls list:', error);
    }
  };

  const fetchTrackingNumbers = async () => {
    try {
      const response = await fetch(`/api/callrail?period=${period}&report=tracking-numbers&clientId=${clientId}`);
      const result = await response.json();
      
      if (result.success) {
        setTrackingNumbers(result.data.trackingNumbers || []);
      }
    } catch (error) {
      console.error('Failed to fetch tracking numbers:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60); // Ensure integer seconds
    return `${mins.toString().padStart(2, '0')}m${secs.toString().padStart(2, '0')}s`;
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calculate metrics for enhanced display
  const missedCallRatio = callData?.metrics?.totalCalls > 0 ? 
    (callData.metrics.missedCalls / callData.metrics.totalCalls) * 100 : 0;
  
  const averageDuration = callData?.metrics?.averageDuration || 0;

  return (
    <div className="mb-6">
      {/* Enhanced CallRail Section with Light Background */}
      <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-xl border border-emerald-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
            <Phone className="w-5 h-5 text-white" />
          </div>
          CallRail Phone Call Analytics
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({period === 'today' ? 'Today' : period === '7days' ? 'Last 7 days' : period === '30days' ? 'Last 30 days' : 'Last 90 days'})
          </span>
        </h2>

        {/* Consolidated Call Metrics Table */}
        <div className="bg-white rounded-lg border overflow-hidden mb-6 shadow-sm">
          <div className="bg-white px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Call Summary Overview
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading call data...</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                {/* Total Calls */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-700">
                    {callData?.metrics?.totalCalls || 0}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">Total Calls</div>
                </div>

                {/* Answered Calls */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-700">
                    {callData?.metrics?.answeredCalls || 0}
                  </div>
                  <div className="text-sm text-green-600 mt-1">Answered</div>
                </div>

                {/* Missed Calls - Highlighted */}
                <div className={`rounded-lg p-4 ${
                  (callData?.metrics?.missedCalls || 0) > 0 
                    ? 'bg-red-100 border-2 border-red-300 shadow-md' 
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className={`text-2xl font-bold ${
                    (callData?.metrics?.missedCalls || 0) > 0 ? 'text-red-700' : 'text-gray-700'
                  }`}>
                    {callData?.metrics?.missedCalls || 0}
                  </div>
                  <div className={`text-sm mt-1 ${
                    (callData?.metrics?.missedCalls || 0) > 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    Missed Calls
                  </div>
                  {(callData?.metrics?.missedCalls || 0) > 0 && (
                    <div className="text-xs text-red-500 mt-1 font-medium">
                      ⚠️ Follow-up needed
                    </div>
                  )}
                </div>

                {/* Missed Call Ratio */}
                <div className={`rounded-lg p-4 ${
                  missedCallRatio > 20 
                    ? 'bg-orange-50 border border-orange-200' 
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <div className={`text-2xl font-bold ${
                    missedCallRatio > 20 ? 'text-orange-700' : 'text-green-700'
                  }`}>
                    {missedCallRatio.toFixed(0)}%
                  </div>
                  <div className={`text-sm mt-1 ${
                    missedCallRatio > 20 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    Miss Rate
                  </div>
                </div>

                {/* Call Duration */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-700">
                    {formatDuration(averageDuration)}
                  </div>
                  <div className="text-sm text-purple-600 mt-1">Avg Duration</div>
                </div>

                {/* Total Duration */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-indigo-700">
                    {formatDuration(callData?.metrics?.totalDuration || 0)}
                  </div>
                  <div className="text-sm text-indigo-600 mt-1">Total Time</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* First-Time vs Repeat Callers Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Caller Type Analysis */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="bg-white px-4 py-3 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Caller Retention Analysis
              </h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* First-Time Callers */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-bold text-sm">NEW</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">First-Time Callers</div>
                        <div className="text-sm text-gray-600">New prospects discovering your business</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-700">
                        {callData?.metrics?.firstTimeCalls || 0}
                      </div>
                      <div className="text-xs text-blue-600">
                        {callData?.metrics?.totalCalls > 0 ? 
                          Math.round((callData.metrics.firstTimeCalls / callData.metrics.totalCalls) * 100) : 0
                        }% of total
                      </div>
                    </div>
                  </div>

                  {/* Repeat Callers */}
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-700 font-bold text-sm">REP</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Repeat Callers</div>
                        <div className="text-sm text-gray-600">Returning customers showing engagement</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-700">
                        {callData?.metrics?.repeatCalls || 0}
                      </div>
                      <div className="text-xs text-green-600">
                        {callData?.metrics?.totalCalls > 0 ? 
                          Math.round((callData.metrics.repeatCalls / callData.metrics.totalCalls) * 100) : 0
                        }% retention
                      </div>
                    </div>
                  </div>

                  {/* Retention Insight */}
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-sm text-purple-800 font-medium">
                      💡 Retention Insight
                    </div>
                    <div className="text-xs text-purple-700 mt-1">
                      {callData?.metrics?.repeatCalls > callData?.metrics?.firstTimeCalls 
                        ? "Strong customer retention! More repeat than new callers." 
                        : callData?.metrics?.firstTimeCalls > 0
                        ? "Growing customer base with good new caller acquisition."
                        : "No caller data available for this period."
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Calls with Follow-up Highlights */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="bg-white px-4 py-3 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-600" />
                Recent Call Activity
              </h3>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {calls.slice(0, 12).map((call: any, index) => (
                    <div 
                      key={call.id || index} 
                      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                        !call.answered 
                          ? 'bg-red-50 border-l-4 border-red-400 shadow-sm hover:shadow-md' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          call.answered 
                            ? 'bg-green-500' 
                            : 'bg-red-500 animate-pulse'
                        }`}></div>
                        <div>
                          <div className="font-medium text-sm">
                            {call.callerNumber || 'Unknown Number'}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>{formatTime(call.startTime)}</span>
                            {call.firstCall && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatDuration(call.duration || 0)}
                        </div>
                        <div className={`text-xs ${
                          call.answered ? 'text-green-600' : 'text-red-600 font-medium'
                        }`}>
                          {call.answered ? 'Answered' : '🔔 Follow-up'}
                        </div>
                      </div>
                    </div>
                  ))}
                  {calls.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Phone className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                      <div className="text-sm">No calls found for this period</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Tracking Numbers */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="bg-white px-4 py-3 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-emerald-600" />
              Active Tracking Numbers
            </h3>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {trackingNumbers.slice(0, 9).map((number: any, index) => (
                  <div key={number.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div>
                      <div className="font-semibold text-sm text-gray-900">
                        {number.formattedNumber || number.phoneNumber}
                      </div>
                      <div className="text-xs text-gray-600">
                        {number.name || 'Tracking Number'}
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                      number.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {number.status || 'active'}
                    </div>
                  </div>
                ))}
                {trackingNumbers.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <PhoneCall className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <div className="text-sm">No tracking numbers found</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrafficSourcesTable({ period, loading, clientId }: { period: string; loading: boolean; clientId?: string }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (clientId) {
      fetchTrafficSources();
    }
  }, [period, clientId]);

  const fetchTrafficSources = async () => {
    try {
      const response = await fetch(`/api/google-analytics?period=${period}&report=traffic-sources&clientId=${clientId}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch traffic sources data:', error);
    }
  };

  const columns = [
    { key: 'source', label: 'Source', format: 'none' as const },
    { key: 'medium', label: 'Medium', format: 'none' as const },
    { key: 'sessions', label: 'Sessions', format: 'number' as const, align: 'right' as const },
    { key: 'users', label: 'Users', format: 'number' as const, align: 'right' as const },
    { key: 'conversions', label: 'Conversions', format: 'number' as const, align: 'right' as const },
  ];

  return (
    <DataTable
      title="Top Traffic Sources (Google Analytics)"
      data={data}
      columns={columns}
      loading={loading}
      maxRows={15}
    />
  );
}