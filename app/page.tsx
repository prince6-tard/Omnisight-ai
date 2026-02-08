import Link from "next/link"
import {
  Satellite,
  ArrowRight,
  Globe,
  Zap,
  Shield,
  BarChart3,
  Layers,
  Brain,
  ChevronRight,
} from "lucide-react"

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8">
          <Satellite className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary tracking-wide uppercase">
            Near-Real-Time Satellite Intelligence
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground tracking-tight text-balance leading-[1.1]">
          OmniSight AI
        </h1>

        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed text-pretty">
          Transform complex satellite data into actionable intelligence. Monitor crop health, detect
          disaster risks, and generate AI-powered decision reports from Sentinel-2, Landsat-8,
          Sentinel-1, and MODIS.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors"
          >
            Launch Live Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg border border-border text-foreground font-medium text-base hover:bg-secondary transition-colors"
          >
            How It Works
          </a>
        </div>

        <div className="mt-16 flex items-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
            <span>All Systems Operational</span>
          </div>
          <span className="hidden sm:block text-border">|</span>
          <span className="hidden sm:block">4 Satellites Active</span>
          <span className="hidden sm:block text-border">|</span>
          <span className="hidden sm:block">10m Resolution</span>
        </div>
      </div>
    </section>
  )
}

function ProblemSolution() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
              The Problem
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
              Satellite data is complex and fragmented
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Raw satellite imagery requires specialized expertise to interpret. Data from different
              satellites uses different formats, resolutions, and measurement scales. Decision-makers
              need clear, actionable insights -- not spectral band analysis.
            </p>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
              The Solution
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
              OmniSight AI simplifies it using AI + satellites
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We fuse data from 4+ satellites, apply rule-based analysis and AI models, and deliver
              plain-language reports with confidence scores. One click gives you crop health, disaster
              risk, and recommended actions.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Satellite,
      title: "Satellite Acquisition",
      description:
        "Sentinel-2, Landsat-8, Sentinel-1 SAR, and MODIS continuously capture multispectral imagery with 5-16 day revisit cycles.",
    },
    {
      number: "02",
      icon: Layers,
      title: "Multi-Satellite Fusion",
      description:
        "Weighted data fusion combines inputs from all satellites, cross-validates measurements, and calculates confidence intervals.",
    },
    {
      number: "03",
      icon: Brain,
      title: "AI Analysis",
      description:
        "Rule-based models and AI interpret fused data to detect crop health, disaster risk, soil moisture, and temperature anomalies.",
    },
    {
      number: "04",
      icon: BarChart3,
      title: "Decision Reports",
      description:
        "Actionable reports with plain-language explanations, confidence scores, and specific recommendations for your location.",
    },
  ]

  return (
    <section id="how-it-works" className="py-24 px-6 bg-card/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">How It Works</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            From satellite acquisition to actionable intelligence in four steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <span className="text-xs font-mono text-muted-foreground mb-2">{step.number}</span>
                <h3 className="text-lg font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              {i < 3 && (
                <ChevronRight className="hidden md:block absolute top-8 -right-4 w-5 h-5 text-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function UseCases() {
  const cases = [
    {
      icon: Globe,
      title: "Agriculture",
      items: [
        "Crop presence detection via NDVI",
        "Vegetation health scoring (0-100)",
        "Yield estimation per hectare",
        "AI irrigation & fertilizer advice",
      ],
    },
    {
      icon: Shield,
      title: "Disaster Management",
      items: [
        "Flood risk from SAR moisture data",
        "Drought detection from NDVI anomaly",
        "Heat stress from thermal imaging",
        "Time-sensitivity classifications",
      ],
    },
    {
      icon: Zap,
      title: "Urban Planning",
      items: [
        "Surface temperature mapping",
        "Vegetation coverage analysis",
        "Heat island identification",
        "Environmental impact assessment",
      ],
    },
  ]

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Use Cases</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            From precision agriculture to disaster response -- real satellite intelligence for real
            decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cases.map((c) => (
            <div
              key={c.title}
              className="p-8 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
            >
              <c.icon className="w-8 h-8 text-primary mb-6" />
              <h3 className="text-xl font-semibold text-foreground mb-4">{c.title}</h3>
              <ul className="space-y-3">
                {c.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DataSources() {
  const satellites = [
    { name: "Sentinel-2", type: "Optical", resolution: "10m", use: "NDVI, Crop Detection", revisit: "5 days" },
    { name: "Sentinel-1", type: "SAR Radar", resolution: "10m", use: "Soil Moisture, Flood", revisit: "6 days" },
    { name: "Landsat-8", type: "Thermal", resolution: "30m", use: "Temperature, Heat Stress", revisit: "16 days" },
    { name: "MODIS", type: "Regional", resolution: "1km", use: "Broad Monitoring", revisit: "1-2 days" },
  ]

  return (
    <section className="py-24 px-6 bg-card/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Data Sources</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            All data sourced from Google Earth Engine. &ldquo;Real-time&rdquo; means near-real-time
            based on satellite revisit cycles (5-16 days).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {satellites.map((sat) => (
            <div key={sat.name} className="p-6 rounded-xl bg-background border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Satellite className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">{sat.name}</span>
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="font-mono text-foreground">{sat.type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Resolution</dt>
                  <dd className="font-mono text-foreground">{sat.resolution}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Revisit</dt>
                  <dd className="font-mono text-foreground">{sat.revisit}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Primary Use</dt>
                  <dd className="font-mono text-foreground text-right text-xs">{sat.use}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
          Click location. See condition. Understand risk. Get AI advice.
        </h2>
        <p className="mt-6 text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Start monitoring any location on Earth with real satellite data. No setup required.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 mt-10 px-10 py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-colors"
        >
          Launch Live Dashboard
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Satellite className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">OmniSight AI</span>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Data sourced from Sentinel-2, Sentinel-1, Landsat-8, and MODIS via Google Earth Engine.
          Near-real-time based on satellite revisit cycles.
        </p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Operational</span>
        </div>
      </div>
    </footer>
  )
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <ProblemSolution />
      <HowItWorks />
      <UseCases />
      <DataSources />
      <CTASection />
      <Footer />
    </main>
  )
}
