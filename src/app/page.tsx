'use client';

import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  BarChart2,
  Target,
  MapPin,
  Search,
  Bot,
  Facebook,
  CheckCircle2,
  Zap,
  Shield,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: Search,
      title: "Analytics & SEO",
      description: "Track website traffic, user behavior, and search performance with Google Analytics 4 and Search Console integration."
    },
    {
      icon: Target,
      title: "Google Ads Management",
      description: "Monitor ad campaigns, conversions, cost-per-click, and ROI across all your Google Ads accounts in real-time."
    },
    {
      icon: MapPin,
      title: "Google Business Profile",
      description: "Track profile views, customer actions, calls, directions requests, and reviews from your Google Business listings."
    },
    {
      icon: Bot,
      title: "AI GEO Tracking",
      description: "Monitor your brand presence across ChatGPT, Perplexity, Gemini, and other AI platforms with citation analysis."
    },
    {
      icon: Facebook,
      title: "Social Media Analytics",
      description: "Track Facebook page performance, engagement metrics, post reach, and audience demographics in one place."
    },
    {
      icon: BarChart2,
      title: "Unified Reporting",
      description: "All your marketing data in one beautiful dashboard with automated daily, weekly, and monthly reports."
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Real-Time Data",
      description: "Get instant access to your latest marketing metrics without delays."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with encrypted data transmission and storage."
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "Eliminate hours of manual reporting with automated data aggregation."
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--coral), var(--accent))' }}>
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Ultimate Report Dashboard
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                All-in-One Marketing Analytics
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg"
            style={{
              backgroundColor: 'var(--coral)',
              color: 'white',
              boxShadow: '0 2px 8px var(--shadow)'
            }}
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: 'rgba(196, 112, 79, 0.1)', color: 'var(--coral)' }}>
            <Zap className="w-4 h-4" />
            <span className="text-sm font-semibold">Marketing Analytics Made Simple</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6" style={{ color: 'var(--text-primary)' }}>
            Your Complete Marketing
            <br />
            <span style={{ color: 'var(--coral)' }}>Analytics Dashboard</span>
          </h1>

          <p className="text-xl mb-10" style={{ color: 'var(--text-secondary)' }}>
            Track all your marketing channels in one place. Google Ads, Analytics, Business Profile,
            AI citations, and social media—unified in a beautiful, easy-to-understand dashboard.
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/demo')}
              className="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 hover:shadow-xl flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, var(--coral), var(--accent))',
                color: 'white',
                boxShadow: '0 4px 20px var(--shadow)'
              }}
            >
              View Live Demo
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 bg-white hover:shadow-lg"
              style={{
                color: 'var(--text-primary)',
                border: '2px solid var(--border-color)',
                boxShadow: '0 2px 8px var(--shadow)'
              }}
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-primary)] z-10"></div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              boxShadow: '0 20px 60px var(--shadow-hover)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div className="aspect-video bg-white/50 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <BarChart2 className="w-24 h-24 mx-auto mb-4" style={{ color: 'var(--coral)', opacity: 0.3 }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Dashboard Preview
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
            Everything You Need in One Place
          </h2>
          <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
            Powerful features designed for modern marketing teams
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 transition-all duration-200 hover:-translate-y-1"
                style={{
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 2px 8px var(--shadow)'
                }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: 'rgba(196, 112, 79, 0.1)' }}
                >
                  <Icon className="w-7 h-7" style={{ color: 'var(--coral)' }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-white rounded-3xl p-12" style={{ border: '1px solid var(--border-color)' }}>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
              Why Choose Our Dashboard?
            </h2>
            <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
              Built for performance, designed for simplicity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'linear-gradient(135deg, var(--coral), var(--accent))' }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {benefit.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div
          className="rounded-3xl p-12 text-center"
          style={{
            background: 'linear-gradient(135deg, var(--coral), var(--accent))',
            boxShadow: '0 20px 60px var(--shadow-hover)'
          }}
        >
          <h2 className="text-4xl font-black text-white mb-4">
            Trusted by Marketing Teams
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join hundreds of businesses using our dashboard to track their marketing performance
          </p>
          <div className="flex items-center justify-center gap-12 mb-8">
            <div>
              <div className="text-5xl font-black text-white mb-2">500+</div>
              <div className="text-white/80">Active Users</div>
            </div>
            <div>
              <div className="text-5xl font-black text-white mb-2">10M+</div>
              <div className="text-white/80">Data Points</div>
            </div>
            <div>
              <div className="text-5xl font-black text-white mb-2">99.9%</div>
              <div className="text-white/80">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-white rounded-3xl p-16 text-center" style={{ border: '1px solid var(--border-color)' }}>
          <h2 className="text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-10" style={{ color: 'var(--text-secondary)' }}>
            Start tracking your marketing performance today
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/demo')}
              className="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 hover:shadow-xl"
              style={{
                background: 'linear-gradient(135deg, var(--coral), var(--accent))',
                color: 'white',
                boxShadow: '0 4px 20px var(--shadow)'
              }}
            >
              View Demo Dashboard
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 bg-transparent hover:bg-black/5"
              style={{
                color: 'var(--text-primary)',
                border: '2px solid var(--border-color)'
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p style={{ color: 'var(--text-secondary)' }}>
            © 2026 Ultimate Report Dashboard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
