import { Link } from 'react-router-dom';
import Galaxy from './Galaxy';
import {
  ArrowRight,
  Satellite,
  Globe,
  Zap,
  Shield,
  BarChart3,
  Layers,
  Brain,
  Leaf,
  AlertTriangle,
  Thermometer,
  ChevronRight,
} from 'lucide-react';

const steps = [
  {
    icon: Satellite,
    title: 'Satellite Capture',
    description: 'Multi-spectral data from Sentinel-2, Landsat-8, Sentinel-1 SAR, and MODIS sensors.',
  },
  {
    icon: Layers,
    title: 'Data Fusion',
    description: 'Cross-validated fusion of optical, radar, and thermal bands for maximum reliability.',
  },
  {
    icon: Brain,
    title: 'AI Analysis',
    description: 'Rule-based + ML models generate explainable insights with confidence scoring.',
  },
  {
    icon: Shield,
    title: 'Decision Report',
    description: 'Actionable recommendations in plain language with full data transparency.',
  },
];

const useCases = [
  {
    icon: Leaf,
    title: 'Agriculture',
    description: 'Crop health monitoring, yield estimation, irrigation scheduling, and pest detection using NDVI and multi-spectral analysis.',
    color: '#10b981',
  },
  {
    icon: AlertTriangle,
    title: 'Disaster Management',
    description: 'Flood risk mapping, drought monitoring, wildfire detection, and real-time hazard alerts from SAR and thermal data.',
    color: '#f59e0b',
  },
  {
    icon: Thermometer,
    title: 'Urban Planning',
    description: 'Urban heat island detection, land use classification, and environmental impact assessment with surface temperature mapping.',
    color: '#ef4444',
  },
];

const LandingPage = () => {
  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-[var(--color-bg-primary)]">
      {/* Hero Section */}
      <section className="relative w-full h-screen overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Galaxy
            mouseRepulsion
            mouseInteraction
            density={1}
            glowIntensity={0.3}
            saturation={0}
            hueShift={140}
            twinkleIntensity={0.3}
            rotationSpeed={0.1}
            repulsionStrength={2}
            autoCenterRepulsion={0}
            starSpeed={0.5}
            speed={1}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 max-w-5xl mx-auto">
          <div className="mb-6 animate-fade-in-down">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 backdrop-blur-md text-[var(--color-accent-light)] text-xs font-medium uppercase tracking-wider">
              <Satellite className="w-3.5 h-3.5 mr-2" />
              Real Satellite Data via Google Earth Engine
            </div>
          </div>

          <h1 className="text-5xl md:text-8xl font-bold text-[var(--color-text-primary)] mb-6 tracking-tight">
            OmniSight AI
          </h1>

          <p className="text-lg md:text-2xl text-[var(--color-text-secondary)] max-w-3xl mb-4 leading-relaxed font-light">
            Planetary-scale satellite intelligence at your fingertips.
          </p>
          <p className="text-base text-[var(--color-text-muted)] max-w-2xl mb-12">
            Click a location. See conditions. Understand risk. Get AI-powered advice.
            Powered by Sentinel-2, Landsat-8, Sentinel-1 SAR, and MODIS.
          </p>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Link
              to="/dashboard"
              className="group relative px-8 py-4 bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-light)] rounded-lg font-semibold text-lg shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-[var(--color-accent)]/40 transition-all duration-300 flex items-center"
            >
              Launch Live Dashboard
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a href="#how-it-works" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors font-medium flex items-center">
              Learn how it works
              <ChevronRight className="w-4 h-4 ml-1" />
            </a>
          </div>

          <div className="absolute bottom-10 left-0 w-full grid grid-cols-1 md:grid-cols-3 gap-8 px-10 text-left opacity-60">
            <div className="flex items-center gap-3">
              <Globe className="w-7 h-7 text-[var(--color-accent-light)]" />
              <div>
                <h3 className="text-[var(--color-text-primary)] font-semibold text-sm">Global Coverage</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Multi-satellite data fusion</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-7 h-7 text-[var(--color-warning)]" />
              <div>
                <h3 className="text-[var(--color-text-primary)] font-semibold text-sm">Near Real-Time</h3>
                <p className="text-xs text-[var(--color-text-muted)]">5-16 day revisit cycles</p>
              </div>
            </div>
            <div className="flex items-center gap-3 md:justify-end">
              <BarChart3 className="w-7 h-7 text-[var(--color-success)]" />
              <div>
                <h3 className="text-[var(--color-text-primary)] font-semibold text-sm">AI-Powered</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Explainable analysis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution Section */}
      <section className="py-24 px-6 bg-[var(--color-bg-secondary)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--color-danger)] font-semibold mb-3">The Problem</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-6 leading-tight">
                Satellite data is complex, fragmented, and inaccessible.
              </h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                Agricultural planners, disaster response teams, and environmental agencies need timely satellite insights.
                But raw data from multiple sensors requires specialized knowledge to process, interpret, and act upon.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--color-success)] font-semibold mb-3">Our Solution</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-6 leading-tight">
                One platform. All satellites. Instant intelligence.
              </h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                OmniSight AI fuses data from 4 satellite constellations using Google Earth Engine, applies AI analysis,
                and delivers plain-language recommendations with full transparency on data sources and confidence levels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-[var(--color-bg-primary)]">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent-light)] font-semibold mb-3">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-16">
            From satellite signal to actionable decision
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center">
                <div className="w-16 h-16 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center mb-5">
                  <step.icon className="w-7 h-7 text-[var(--color-accent-light)]" />
                </div>
                <div className="absolute top-8 -right-4 w-8 text-[var(--color-text-muted)] hidden md:block last:hidden">
                  {i < steps.length - 1 && <ArrowRight className="w-5 h-5" />}
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{step.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 px-6 bg-[var(--color-bg-secondary)]">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent-light)] font-semibold mb-3">Use Cases</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-16">
            Built for real-world decision makers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((uc, i) => (
              <div key={i} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-8 text-left hover:border-[var(--color-border-active)] transition-colors">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-5" style={{ backgroundColor: uc.color + '15' }}>
                  <uc.icon className="w-6 h-6" style={{ color: uc.color }} />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">{uc.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{uc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-[var(--color-bg-primary)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-6">
            Ready to see it in action?
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-10">
            Click anywhere on the map to receive multi-satellite analysis, crop health assessment,
            disaster risk detection, and AI-generated recommendations.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-10 py-4 bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-light)] rounded-lg font-semibold text-lg shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-[var(--color-accent)]/40 transition-all duration-300"
          >
            Launch Live Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Satellite className="w-5 h-5 text-[var(--color-accent-light)]" />
            <span className="font-bold text-[var(--color-text-primary)]">OmniSight AI</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            Data sourced from Google Earth Engine. Near-real-time based on satellite revisit cycles (5-16 days).
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
