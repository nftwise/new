'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ChevronRight, Clock, AlertTriangle, CheckCircle, Search, Download, ArrowUpDown } from 'lucide-react';
import { Card, StatCard } from '@/components/neural/Card';
import { Badge } from '@/components/neural/Badge';
import { Header } from '@/components/neural/Header';

interface ClientOverview {
  id: string;
  name: string;
  healthScore: number;
  status: 'healthy' | 'warning' | 'critical';
  criticalAlerts: number;
  highAlerts: number;
  recentIssues: any[];
  avgCTR: number;
  totalSpend: number;
  totalConversions: number;
}

type SortBy = 'name' | 'health' | 'spend' | 'alerts';
type SortOrder = 'asc' | 'desc';

export default function ClientsOverviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clients, setClients] = useState<ClientOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') fetchClientsOverview();
  }, [status]);

  const fetchClientsOverview = async () => {
    try {
      const res = await fetch('/api/clients/list');
      const data = await res.json();
      
      if (data.success && data.clients) {
        const withHealth = await Promise.all(
          data.clients.map(async (c: any) => {
            try {
              const dRes = await fetch(`/api/ads-analysis/dashboard?clientId=${c.id}`);
              if (dRes.ok) {
                const d = await dRes.json();
                const h = d.data?.healthScore;
                const s = d.data?.summary;
                let status = 'healthy';
                if (h?.health_score < 40) status = 'critical';
                else if (h?.health_score < 70) status = 'warning';
                return {
                  id: c.id, name: c.name, healthScore: h?.health_score || 0, status,
                  criticalAlerts: h?.critical_alerts || 0, highAlerts: h?.high_alerts || 0,
                  recentIssues: (d.data?.insights || []).slice(0, 3),
                  avgCTR: s?.avgCTR || 0, totalSpend: s?.totalSpend || 0, totalConversions: s?.totalConversions || 0
                };
              }
            } catch (e) {}
            return { id: c.id, name: c.name, healthScore: 0, status: 'warning', criticalAlerts: 0, highAlerts: 0, recentIssues: [], avgCTR: 0, totalSpend: 0, totalConversions: 0 };
          })
        );
        setClients(withHealth);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = clients.filter(c => {
      if (filterBy === 'critical') return c.status === 'critical';
      if (filterBy === 'warning') return c.status === 'warning' || c.status === 'critical';
      return true;
    });

    if (searchQuery) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    result.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'health':
          compareValue = a.healthScore - b.healthScore;
          break;
        case 'spend':
          compareValue = a.totalSpend - b.totalSpend;
          break;
        case 'alerts':
          compareValue = (a.criticalAlerts + a.highAlerts) - (b.criticalAlerts + b.highAlerts);
          break;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return result;
  }, [clients, filterBy, searchQuery, sortBy, sortOrder]);

  const stats = {
    healthy: clients.filter(c => c.status === 'healthy').length,
    warning: clients.filter(c => c.status === 'warning').length,
    critical: clients.filter(c => c.status === 'critical').length,
  };

  const toggleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Client Name', 'Health Score', 'Status', 'Critical Alerts', 'High Alerts', 'Avg CTR', 'Total Spend', 'Total Conversions'];
    const rows = filtered.map(c => [
      c.name,
      c.healthScore,
      c.status,
      c.criticalAlerts,
      c.highAlerts,
      c.avgCTR.toFixed(2),
      c.totalSpend.toFixed(2),
      c.totalConversions
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients-overview-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)'}}><div>Loading...</div></div>;

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)'}}>
      <Header user={{email: session?.user?.email || '', role: session?.user?.role || 'user'}} />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}} className="mb-8">
          <StatCard label="Healthy" value={stats.healthy.toString()} icon={<CheckCircle className="w-5 h-5" style={{color: 'var(--sage)'}} />} change={{value: 100, isPositive: true, label: 'All good'}} />
          <StatCard label="Warnings" value={stats.warning.toString()} icon={<AlertTriangle className="w-5 h-5" style={{color: 'var(--gold)'}} />} change={{value: stats.warning, isPositive: false, label: 'Needs attention'}} />
          <StatCard label="Critical" value={stats.critical.toString()} icon={<AlertCircle className="w-5 h-5" style={{color: 'var(--coral)'}} />} change={{value: stats.critical, isPositive: false, label: 'Action required'}} />
        </div>

        <Card className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-3">
              {['all', 'warning', 'critical'].map(f => (
                <button key={f} onClick={() => setFilterBy(f)} className={`px-4 py-2 rounded-full text-sm font-medium ${filterBy === f ? 'neural-btn neural-btn-primary' : 'neural-btn neural-btn-outline'}`}>
                  {f === 'all' ? 'All' : f === 'critical' ? 'Critical' : 'Warnings'}
                </button>
              ))}
            </div>
            <button onClick={exportToCSV} className="neural-btn neural-btn-outline flex items-center gap-2 px-4 py-2 text-sm">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </Card>

        <Card className="mb-8">
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg" style={{background: 'rgba(44,36,25,0.05)'}}>
            <Search className="w-5 h-5" style={{color: 'var(--text-secondary)', opacity: 0.5}} />
            <input
              type="text"
              placeholder="Search clients by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none flex-1 text-sm"
              style={{color: 'var(--text-primary)'}}
            />
          </div>
        </Card>

        <Card className="mb-4">
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => toggleSort('name')}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium transition-all ${sortBy === 'name' ? 'neural-btn neural-btn-primary' : 'neural-btn neural-btn-outline'}`}
            >
              Name {sortBy === 'name' && <ArrowUpDown className="w-3 h-3" />}
            </button>
            <button 
              onClick={() => toggleSort('health')}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium transition-all ${sortBy === 'health' ? 'neural-btn neural-btn-primary' : 'neural-btn neural-btn-outline'}`}
            >
              Health {sortBy === 'health' && <ArrowUpDown className="w-3 h-3" />}
            </button>
            <button 
              onClick={() => toggleSort('spend')}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium transition-all ${sortBy === 'spend' ? 'neural-btn neural-btn-primary' : 'neural-btn neural-btn-outline'}`}
            >
              Spend {sortBy === 'spend' && <ArrowUpDown className="w-3 h-3" />}
            </button>
            <button 
              onClick={() => toggleSort('alerts')}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium transition-all ${sortBy === 'alerts' ? 'neural-btn neural-btn-primary' : 'neural-btn neural-btn-outline'}`}
            >
              Alerts {sortBy === 'alerts' && <ArrowUpDown className="w-3 h-3" />}
            </button>
          </div>
        </Card>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <Card className="text-center py-12">
              <p style={{color: 'var(--text-secondary)'}}>No clients found matching your search or filters.</p>
            </Card>
          ) : (
            filtered.map(c => (
              <Card key={c.id} className="cursor-pointer" onClick={() => router.push(`/ads-analysis?clientId=${c.id}`)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div style={{width: 40, height: 40, background: 'linear-gradient(135deg, var(--accent), var(--gold))', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <span style={{color: 'white', fontWeight: 'bold'}}>{c.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 style={{fontSize: 18, fontWeight: 900, color: 'var(--text-primary)'}}>{c.name}</h3>
                        <p style={{fontSize: 12, opacity: 0.6}}>Score: {c.healthScore}/100</p>
                      </div>
                      <Badge variant={c.status === 'critical' ? 'coral' : c.status === 'warning' ? 'gold' : 'sage'}>{c.status.toUpperCase()}</Badge>
                    </div>
                    
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '12px', background: 'rgba(44,36,25,0.02)', borderRadius: 8}}>
                      <div><div style={{fontSize: 11, opacity: 0.6}}>CTR</div><div style={{fontSize: 16, fontWeight: 900}}>{c.avgCTR.toFixed(2)}%</div></div>
                      <div><div style={{fontSize: 11, opacity: 0.6}}>Spend</div><div style={{fontSize: 16, fontWeight: 900}}>\${(c.totalSpend || 0).toLocaleString('en-US', {maximumFractionDigits: 0})}</div></div>
                      <div><div style={{fontSize: 11, opacity: 0.6}}>Conversions</div><div style={{fontSize: 16, fontWeight: 900}}>{(c.totalConversions || 0).toLocaleString()}</div></div>
                    </div>

                    {c.recentIssues.length > 0 && (
                      <div style={{marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(44,36,25,0.1)'}}>
                        <div style={{fontSize: 11, fontWeight: 600, opacity: 0.6, marginBottom: 8}}>RECENT ISSUES</div>
                        {c.recentIssues.map((issue: any) => (
                          <div key={issue.id} style={{padding: 8, background: 'rgba(196,112,79,0.1)', borderRadius: 6, marginBottom: 6, borderLeft: '2px solid var(--coral)', fontSize: 12}}>
                            <div style={{fontWeight: 600, color: 'var(--text-primary)'}}>{issue.title}</div>
                            <div style={{fontSize: 11, opacity: 0.7}}>{issue.description}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5" style={{opacity: 0.4, marginLeft: 12}} />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
