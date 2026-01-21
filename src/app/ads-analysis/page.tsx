'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DollarSign,
  Target,
  MousePointerClick,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  ArrowLeft
} from 'lucide-react';
import { Card, StatCard } from '@/components/neural/Card';
import { MetricsDiagnostics } from '@/components/neural/MetricsDiagnostics';
import { AnomalyDashboard } from '@/components/ads-analysis/AnomalyDashboard';
import { LocalServiceAlertPanel } from '@/components/ads-analysis/LocalServiceAlertPanel';
import { Badge } from '@/components/neural/Badge';
import { Grid } from '@/components/neural/Grid';
import { TrendChart, ProgressBar, SegmentedBar } from '@/components/neural/Chart';
import { Header } from '@/components/neural/Header';

const formatCurrency = (value: number) => {
  if (!value) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatNumber = (value: number) => {
  if (!value) return '0';
  return new Intl.NumberFormat('en-US').format(Math.round(value));
};

function HealthScoreGauge({ score }: { score: number }) {
  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = 'var(--coral)';
  if (score >= 80) color = 'var(--sage)';
  else if (score >= 60) color = 'var(--accent)';

  return (
    <div className="relative" style={{ width: 200, height: 200 }}>
      <svg height={200} width={200} style={{ filter: 'drop-shadow(0 4px 12px rgba(44, 36, 25, 0.08))' }}>
        <circle
          stroke="rgba(44, 36, 25, 0.1)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={100}
          cy={100}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={100}
          cy={100}
          transform="rotate(-90 100 100)"
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-black" style={{ color }}>
          {score}
        </div>
        <div className="text-sm opacity-50 mt-1">Score</div>
      </div>
    </div>
  );
}

function AdsAnalysisContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    new Date()
  ]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchClients();
    }
  }, [status, router]);

  const fetchClients = async () => {
    try {
      setError(null);
      const res = await fetch('/api/clients/list');
      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const result = await res.json();
      if (result.success && result.clients && result.clients.length > 0) {
        setClients(result.clients);
        const urlClientId = searchParams.get('clientId');
        if (urlClientId && result.clients.some((c: any) => c.id === urlClientId)) {
          setSelectedClientId(urlClientId);
        } else {
          setSelectedClientId(result.clients[0].id);
        }
        setLoading(false);
      } else {
        throw new Error('No clients found');
      }
    } catch (err: any) {
      console.error('Failed to fetch clients:', err);
      setError(`Failed to load clients: ${err.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClientId) {
      fetchDashboardData(selectedClientId);
    }
  }, [selectedClientId]);

  const fetchDashboardData = async (clientId: string) => {
    try {
      setError(null);
      const res = await fetch(`/api/ads-analysis/dashboard?clientId=${clientId}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to load data');
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(`Failed to load dashboard: ${err.message}`);
      setData(null);
    }
  };

  const spendByDate = useMemo(() => {
    if (!data?.campaigns) return [];
    const dateMap = new Map<string, number>();
    data.campaigns.forEach((camp: any) => {
      const current = dateMap.get(camp.date) || 0;
      dateMap.set(camp.date, current + Number(camp.cost));
    });

    return Array.from(dateMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, value]) => ({ label, value }));
  }, [data?.campaigns]);

  const topCampaigns = useMemo(() => {
    if (!data?.campaigns) return [];
    return [...data.campaigns]
      .sort((a: any, b: any) => Number(b.cost) - Number(a.cost))
      .slice(0, 5);
  }, [data?.campaigns]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5" style={{ color: 'var(--coral)' }} />;
      case 'high':
        return <AlertTriangle className="w-5 h-5" style={{ color: 'var(--accent)' }} />;
      case 'medium':
        return <Info className="w-5 h-5" style={{ color: 'var(--slate)' }} />;
      default:
        return <Lightbulb className="w-5 h-5" style={{ color: 'var(--sage)' }} />;
    }
  };

  const getSeverityBadgeVariant = (severity: string): 'coral' | 'gold' | 'slate' | 'sage' => {
    switch (severity) {
      case 'critical': return 'coral';
      case 'high': return 'gold';
      case 'medium': return 'slate';
      default: return 'sage';
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
        <div className="text-lg" style={{ color: 'var(--text-secondary)' }}>Authenticating...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
        <Header user={{ email: session?.user?.email || '', role: 'user' }} />
        <div className="max-w-7xl mx-auto px-8 py-12">
          <Card className="text-center py-12">
            <div className="flex flex-col items-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: 'rgba(196, 112, 79, 0.1)' }}
              >
                <AlertCircle className="w-8 h-8" style={{ color: 'var(--coral)' }} />
              </div>
              <h3 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
                Error Loading Dashboard
              </h3>
              <p className="text-sm opacity-60 mb-6">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  fetchClients();
                }}
                className="neural-btn neural-btn-primary"
              >
                Retry
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (loading || !clients.length) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
        <div className="text-center">
          <div className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>
            Loading...
          </div>
          <p className="text-sm opacity-50">Fetching dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
      <Header
        user={{
          email: session?.user?.email || '',
          role: session?.user?.role || 'user',
          companyName: clients.find(c => c.id === selectedClientId)?.name
        }}
        showDatePicker={true}
        startDate={dateRange[0] || undefined}
        endDate={dateRange[1] || undefined}
        onDateChange={(dates) => setDateRange(dates)}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        
        {/* Back Button & Client Selector */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/clients-overview')}
            className="flex items-center gap-2 text-sm font-medium opacity-70 hover:opacity-100 transition-opacity mb-6"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Clients
          </button>

          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>
              {clients.find(c => c.id === selectedClientId)?.name}
            </h1>
            <div className="flex gap-4 items-center">
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="neural-btn neural-btn-outline text-left"
                style={{ padding: '12px 16px', fontSize: '14px' }}
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* LOCAL SERVICE ALERT PANEL - TOP PRIORITY */}
        {selectedClientId && <LocalServiceAlertPanel clientId={selectedClientId} />}

        {data ? (
          <>
            {/* GOLDEN RATIO Z-PATTERN GRID */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'var(--width-minor) var(--width-major)',
              gap: 'var(--space-lg)',
              marginBottom: 'var(--space-xl)'
            }}>
              {/* [1] HEALTH SCORE - TOP LEFT (38.2%) */}
              <Card hover={false} style={{ gridRow: '1 / 3' }}>
                <div className="text-center h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black mb-6" style={{ color: 'var(--text-primary)' }}>
                      Account Health
                    </h3>
                    <div className="flex justify-center mb-8">
                      <HealthScoreGauge score={data.healthScore?.health_score || 0} />
                    </div>
                  </div>

                  <div className="space-y-3 text-left mt-8">
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(196, 112, 79, 0.08)' }}>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" style={{ color: 'var(--coral)' }} />
                        <span className="text-sm font-medium">Critical</span>
                      </div>
                      <Badge variant="coral">{data.healthScore?.critical_alerts || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(217, 168, 84, 0.08)' }}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                        <span className="text-sm font-medium">High</span>
                      </div>
                      <Badge variant="gold">{data.healthScore?.high_alerts || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(92, 88, 80, 0.08)' }}>
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4" style={{ color: 'var(--slate)' }} />
                        <span className="text-sm font-medium">Medium</span>
                      </div>
                      <Badge variant="slate">{data.healthScore?.medium_alerts || 0}</Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* [2] KEY METRICS GRID - TOP RIGHT (61.8%) */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: 'var(--space-md)' 
              }}>
                <StatCard
                  label="Total Ad Spend"
                  value={formatCurrency(data.summary?.totalSpend || 0)}
                  icon={<DollarSign className="w-5 h-5" style={{ color: 'var(--coral)' }} />}
                  change={{
                    value: 12,
                    isPositive: false,
                    label: 'vs last period'
                  }}
                />

                <StatCard
                  label="Total Conversions"
                  value={formatNumber(data.summary?.totalConversions || 0)}
                  icon={<Target className="w-5 h-5" style={{ color: 'var(--sage)' }} />}
                  change={{
                    value: 18,
                    isPositive: true,
                    label: 'vs last period'
                  }}
                />

                <StatCard
                  label="Average CTR"
                  value={`${(data.summary?.avgCTR || 0).toFixed(2)}%`}
                  icon={<MousePointerClick className="w-5 h-5" style={{ color: 'var(--accent)' }} />}
                  change={{
                    value: 8,
                    isPositive: true,
                    label: `${formatNumber(data.summary?.totalClicks || 0)} clicks`
                  }}
                />

                <StatCard
                  label="Average CPA"
                  value={formatCurrency(data.summary?.avgCPA || 0)}
                  icon={<TrendingUp className="w-5 h-5" style={{ color: 'var(--slate)' }} />}
                  change={{
                    value: 5,
                    isPositive: false,
                    label: 'cost per conversion'
                  }}
                />
              </div>
            </div>

            {/* [3] SPEND TREND CHART - FULL WIDTH CENTER */}
            {spendByDate.length > 0 && (
              <Card className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                      Daily Ad Spend Trend
                    </h3>
                    <p className="text-sm opacity-60">Daily ad spend trend</p>
                  </div>
                  <Badge variant="gold">
                    {spendByDate[0]?.label} - {spendByDate[spendByDate.length - 1]?.label}
                  </Badge>
                </div>

                <TrendChart
                  data={spendByDate}
                  height={320}
                  color="var(--coral)"
                  showGrid={true}
                  formatValue={formatCurrency}
                />
              </Card>
            )}

            {/* [4] & [5] TWO-COLUMN SECTION - CAMPAIGNS + FUNNEL */}
            <div style={{ display: 'grid', gridTemplateColumns: 'var(--width-major) var(--width-minor)', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
              {topCampaigns.length > 0 && (
                <Card>
                  <h3 className="text-xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>
                    Top Campaigns by Spend
                  </h3>

                  <div className="space-y-4">
                    {topCampaigns.map((campaign: any) => (
                      <div key={campaign.id} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                              {campaign.campaign_name}
                            </div>
                            <div className="text-xs opacity-50">
                              {formatNumber(campaign.clicks || 0)} clicks • {campaign.conversions || 0} conv
                            </div>
                          </div>
                          <div className="text-right ml-4 flex-shrink-0">
                            <div className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>
                              {formatCurrency(campaign.cost)}
                            </div>
                            <Badge
                              variant={
                                campaign.ctr > (data.summary?.avgCTR || 0) ? 'sage' : 'coral'
                              }
                            >
                              {campaign.ctr?.toFixed(2)}% CTR
                            </Badge>
                          </div>
                        </div>

                        <ProgressBar
                          value={Number(campaign.cost)}
                          max={Number(topCampaigns[0]?.cost || 1)}
                          showPercentage={false}
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card>
                <h3 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
                  Conversion Funnel
                </h3>
                <p className="text-sm opacity-60 mb-6">From impression to conversion</p>

                <SegmentedBar
                  segments={[
                    { value: data.summary?.totalImpressions || 0, color: 'slate', label: 'Impressions' },
                    { value: data.summary?.totalClicks || 0, color: 'coral', label: 'Clicks' },
                    { value: data.summary?.totalConversions || 0, color: 'sage', label: 'Conversions' }
                  ]}
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)' }} className="mt-8">
                  <div className="text-center">
                    <div className="stat-label mb-2">Click Rate</div>
                    <div className="stat-value text-2xl">
                      {(data.summary?.avgCTR || 0).toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="stat-label mb-2">Conv Rate</div>
                    <div className="stat-value text-2xl">
                      {(
                        ((data.summary?.totalConversions || 0) /
                          (data.summary?.totalClicks || 1)) *
                        100
                      ).toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="stat-label mb-2">Avg CPC</div>
                    <div className="stat-value text-2xl">
                      {formatCurrency(data.summary?.avgCPC || 0)}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* [5.5] METRICS DIAGNOSTICS - Analysis */}
            <Card className="mb-8">
              <div className="mb-6">
                <h3 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                  📊 Campaign Health Analysis
                </h3>
                <p className="text-sm opacity-60 mt-1">Identify exactly what's wrong and how to fix it</p>
              </div>

              <MetricsDiagnostics
                conversions={data.summary?.totalConversions || 0}
                clicks={data.summary?.totalClicks || 0}
                spend={data.summary?.totalSpend || 0}
                impressions={data.summary?.totalImpressions || 0}
                conversionValue={data.summary?.totalConversionValue || 0}
                ctr={data.summary?.avgCTR || 0}
                cpc={data.summary?.avgCPC || 0}
                cpa={data.summary?.avgCPA || 0}
                roas={data.summary?.totalConversionValue ? (data.summary.totalConversionValue / (data.summary.totalSpend || 1)) : 0}
                convRate={(data.summary?.totalConversions || 0) / (data.summary?.totalClicks || 1) * 100}
                qualityScore={data.summary?.avgQualityScore || 7}
                impressionShare={data.summary?.avgImpressionShare || 80}
                targetCPA={100}
              />
            </Card>

            {/* [5.7] ANOMALY DETECTION - Early Warning System */}
            <div className="mb-8">
              <div className="mb-4">
                <h3 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                  🔍 Early Warning System
                </h3>
                <p className="text-sm opacity-60 mt-1">Detect abnormal campaign performance early with seasonal awareness and multi-account benchmarking</p>
              </div>
              <AnomalyDashboard clientId={selectedClientId} sensitivity="medium" />
            </div>

                        {/* [6] INSIGHTS - FULL WIDTH BOTTOM */}
            {data.insights && data.insights.length > 0 && (
              <Card className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                      Active Insights
                    </h3>
                    <p className="text-sm opacity-60">AI-powered recommendations</p>
                  </div>
                  <Badge variant="coral">{data.insights.length} active</Badge>
                </div>

                <div className="space-y-4">
                  {data.insights.map((insight: any) => (
                    <div
                      key={insight.id}
                      className="group p-6 rounded-xl border transition-all hover:shadow-lg"
                      style={{
                        borderColor: 'var(--border-color)',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)'
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{
                            backgroundColor:
                              insight.severity === 'critical'
                                ? 'rgba(196, 112, 79, 0.1)'
                                : insight.severity === 'high'
                                ? 'rgba(217, 168, 84, 0.1)'
                                : 'rgba(92, 88, 80, 0.1)'
                          }}
                        >
                          {getSeverityIcon(insight.severity)}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Badge variant={getSeverityBadgeVariant(insight.severity)} className="mb-2">
                                {insight.severity?.toUpperCase()}
                              </Badge>
                              <h4 className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>
                                {insight.title}
                              </h4>
                            </div>
                            {insight.impact_estimate > 0 && (
                              <div className="text-right">
                                <div className="text-xs opacity-50">Potential Impact</div>
                                <div
                                  className="font-black text-xl"
                                  style={{ color: 'var(--coral)' }}
                                >
                                  {formatCurrency(insight.impact_estimate)}
                                </div>
                              </div>
                            )}
                          </div>

                          <p className="text-sm opacity-70 mb-3">{insight.description}</p>

                          {insight.suggested_action && (
                            <div
                              className="flex items-start gap-2 p-3 rounded-lg text-sm"
                              style={{ backgroundColor: 'rgba(217, 168, 84, 0.1)' }}
                            >
                              <Lightbulb
                                className="w-4 h-4 flex-shrink-0 mt-0.5"
                                style={{ color: 'var(--accent)' }}
                              />
                              <span className="font-medium">{insight.suggested_action}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* [8] CAMPAIGN PERFORMANCE TABLE */}
            {data.campaigns && data.campaigns.length > 0 && (
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                      Campaign Performance
                    </h3>
                    <p className="text-sm opacity-60">Detailed metrics for all campaigns</p>
                  </div>
                  <Badge variant="slate">{data.campaigns.length} campaigns</Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="neural-table">
                    <thead>
                      <tr>
                        <th>Campaign</th>
                        <th className="text-right">Spend</th>
                        <th className="text-right">Clicks</th>
                        <th className="text-right">Conv</th>
                        <th className="text-right">CPA</th>
                        <th className="text-right">CTR</th>
                        <th className="text-right">QS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.campaigns.slice(0, 20).map((campaign: any, idx: number) => (
                        <tr key={idx}>
                          <td>
                            <div className="client-name-cell">
                              <div className="client-name">{campaign.campaign_name}</div>
                              <div className="client-slug">
                                {campaign.campaign_status || 'Active'}
                              </div>
                            </div>
                          </td>
                          <td className="text-right">
                            <div className="metric-value">{formatCurrency(campaign.cost)}</div>
                          </td>
                          <td className="text-right">
                            <div className="metric-value">
                              {formatNumber(campaign.clicks || 0)}
                            </div>
                          </td>
                          <td className="text-right">
                            <div className="metric-value">{campaign.conversions || 0}</div>
                          </td>
                          <td className="text-right">
                            <div className="metric-value">
                              {campaign.cpa > 0 ? formatCurrency(campaign.cpa) : 'N/A'}
                            </div>
                          </td>
                          <td className="text-right">
                            <Badge
                              variant={
                                campaign.ctr > (data.summary?.avgCTR || 0) ? 'sage' : 'coral'
                              }
                            >
                              {campaign.ctr?.toFixed(2)}%
                            </Badge>
                          </td>
                          <td className="text-right">
                            <Badge
                              variant={
                                campaign.quality_score >= 7
                                  ? 'sage'
                                  : campaign.quality_score >= 5
                                  ? 'gold'
                                  : 'coral'
                              }
                            >
                              {campaign.quality_score || 'N/A'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        ) : (
          <Card className="text-center py-12">
            <p className="text-gray-600">No data available. Loading...</p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function AdsAnalysisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
        <div className="text-lg" style={{ color: 'var(--text-secondary)' }}>Loading page...</div>
      </div>
    }>
      <AdsAnalysisContent />
    </Suspense>
  );
}
