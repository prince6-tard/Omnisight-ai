import { useMemo } from 'react';
import { useLocation } from '../context/LocationContext';
import SharedMap from './SharedMap';
import {
  AlertTriangle,
  CloudRain,
  Sun,
  Droplets,
  Shield,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';

function RiskMeter({ level, label }) {
  const config = {
    Low: { color: 'var(--color-success)', pct: 25, bg: '#10b98115' },
    Medium: { color: 'var(--color-warning)', pct: 55, bg: '#f59e0b15' },
    High: { color: 'var(--color-danger)', pct: 85, bg: '#ef444415' },
    Severe: { color: '#dc2626', pct: 95, bg: '#ef444420' },
  };
  const c = config[level] || config.Low;

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5" style={{ borderLeftColor: c.color, borderLeftWidth: '3px' }}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">{label}</span>
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: c.bg, color: c.color }}>
          {level}
        </span>
      </div>
      <div className="w-full h-2 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${c.pct}%`, backgroundColor: c.color }}
        />
      </div>
    </div>
  );
}

function RiskCard({ risk }) {
  const iconMap = {
    Flood: CloudRain,
    Drought: Sun,
    'Heat Stress': AlertTriangle,
  };
  const colorMap = {
    Flood: '#3b82f6',
    Drought: '#f59e0b',
    'Heat Stress': '#ef4444',
  };
  const Icon = iconMap[risk.type] || AlertTriangle;
  const color = colorMap[risk.type] || 'var(--color-warning)';

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-border-active)] transition-colors">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: color + '15' }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{risk.type} Risk</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              risk.level === 'High' || risk.level === 'Severe' ? 'bg-red-500/10 text-[var(--color-danger)]' :
              risk.level === 'Medium' ? 'bg-yellow-500/10 text-[var(--color-warning)]' :
              'bg-green-500/10 text-[var(--color-success)]'
            }`}>
              {risk.level}
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Probability: {risk.probability}%</p>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <p className="text-[var(--color-text-muted)] text-xs mb-0.5">Severity Explanation</p>
          <p className="text-[var(--color-text-secondary)]">{risk.explanation}</p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <span className="text-xs">
            <span className="text-[var(--color-text-muted)]">Time Sensitivity: </span>
            <span className={`font-semibold ${
              risk.urgency === 'Immediate' ? 'text-[var(--color-danger)]' :
              risk.urgency === 'Watch' ? 'text-[var(--color-warning)]' :
              'text-[var(--color-success)]'
            }`}>{risk.urgency}</span>
          </span>
        </div>
        <div>
          <p className="text-[var(--color-text-muted)] text-xs mb-0.5">Mitigation Advice</p>
          <p className="text-xs text-[var(--color-text-secondary)]">{risk.mitigation}</p>
        </div>
        <div className="flex items-center gap-3 pt-2 border-t border-[var(--color-border)] text-xs">
          <span className="text-[var(--color-text-muted)]">Confidence: <span className="text-[var(--color-success)] font-semibold">{risk.confidence}%</span></span>
          <span className="text-[var(--color-text-muted)]">Source: {risk.source}</span>
        </div>
      </div>
    </div>
  );
}

const DisasterRisk = () => {
  const { satelliteData } = useLocation();

  const risks = useMemo(() => {
    if (!satelliteData) return [];
    const d = satelliteData.derived;
    const s = satelliteData.satellites;
    const moisture = d.soil_moisture;
    const temp = s.landsat8.temperature;
    const ndvi = s.sentinel2.indices.ndvi;
    const rainfall = d.rainfall_estimate;

    const result = [];

    // Flood Risk
    const floodProb = Math.min(95, Math.max(5, (moisture - 30) * 2 + (rainfall > 100 ? 20 : 0)));
    result.push({
      type: 'Flood',
      level: d.flood_risk,
      probability: Math.round(floodProb),
      explanation: moisture > 70
        ? `Soil moisture at ${moisture.toFixed(0)}% is critically elevated. SAR backscatter analysis from Sentinel-1 indicates potential waterlogging. Combined with estimated rainfall of ${rainfall.toFixed(0)}mm, flood conditions are possible.`
        : moisture > 50
        ? `Soil moisture at ${moisture.toFixed(0)}% is elevated but within manageable range. Continued monitoring recommended as conditions could deteriorate with additional rainfall.`
        : `Soil moisture at ${moisture.toFixed(0)}% is within normal range. No significant flood indicators detected from SAR analysis.`,
      urgency: d.flood_risk === 'High' ? 'Immediate' : d.flood_risk === 'Medium' ? 'Watch' : 'Normal',
      mitigation: d.flood_risk === 'High'
        ? 'Activate drainage systems. Prepare flood barriers. Alert downstream communities. Move livestock to higher ground.'
        : d.flood_risk === 'Medium'
        ? 'Clear drainage channels. Monitor water levels. Prepare emergency plans.'
        : 'No immediate action required. Standard monitoring continues.',
      confidence: satelliteData.summary.confidence,
      source: `Sentinel-1 SAR (${s.sentinel1.last_acquisition})`,
      trend: moisture > 60 ? 'up' : moisture < 30 ? 'down' : 'stable',
    });

    // Drought Risk
    const droughtProb = Math.min(95, Math.max(5, (50 - moisture) * 1.5 + (ndvi < 0.3 ? 20 : 0)));
    result.push({
      type: 'Drought',
      level: d.drought_risk,
      probability: Math.round(droughtProb),
      explanation: d.drought_risk === 'High'
        ? `Low soil moisture (${moisture.toFixed(0)}%) combined with reduced vegetation index (NDVI: ${ndvi.toFixed(3)}) strongly indicates drought conditions. Estimated rainfall of ${rainfall.toFixed(0)}mm is below average.`
        : d.drought_risk === 'Medium'
        ? `Soil moisture at ${moisture.toFixed(0)}% is below optimal. NDVI readings suggest vegetation is beginning to show stress signs. Monitor closely.`
        : `Soil moisture and vegetation indices are within normal range. No drought indicators detected.`,
      urgency: d.drought_risk === 'High' ? 'Immediate' : d.drought_risk === 'Medium' ? 'Watch' : 'Normal',
      mitigation: d.drought_risk === 'High'
        ? 'Implement emergency irrigation. Consider drought-resistant crop varieties. Reduce non-essential water usage.'
        : d.drought_risk === 'Medium'
        ? 'Increase irrigation frequency. Apply mulch to conserve soil moisture. Monitor NDVI trends.'
        : 'Standard monitoring. Conditions are normal.',
      confidence: satelliteData.summary.confidence,
      source: `Multi-sensor (Sentinel-2, Sentinel-1)`,
      trend: moisture < 25 ? 'up' : 'down',
    });

    // Heat Stress
    const heatProb = Math.min(95, Math.max(5, (temp - 25) * 4));
    result.push({
      type: 'Heat Stress',
      level: d.heat_stress === 'Severe' ? 'High' : d.heat_stress,
      probability: Math.round(heatProb),
      explanation: temp > 38
        ? `Surface temperature of ${temp.toFixed(1)}\u00B0C from Landsat-8 thermal bands indicates severe heat stress. Land surface temperature (LST) at ${s.landsat8.lst.toFixed(1)}\u00B0C confirms urban heat island or agricultural heat exposure.`
        : temp > 32
        ? `Surface temperature at ${temp.toFixed(1)}\u00B0C is above comfort threshold for most crops. MODIS confirms: ${s.modis.anomaly}.`
        : `Surface temperature at ${temp.toFixed(1)}\u00B0C is within acceptable range. No heat stress detected.`,
      urgency: temp > 38 ? 'Immediate' : temp > 32 ? 'Watch' : 'Normal',
      mitigation: temp > 38
        ? 'Deploy shade structures for sensitive crops. Schedule irrigation during dawn/dusk. Consider heat-tolerant varieties.'
        : temp > 32
        ? 'Monitor crop stress indicators. Ensure adequate water supply for evapotranspiration.'
        : 'No action needed. Temperature within normal parameters.',
      confidence: satelliteData.summary.confidence,
      source: `Landsat-8 TIRS (${s.landsat8.last_acquisition})`,
      trend: temp > 35 ? 'up' : 'stable',
    });

    return result;
  }, [satelliteData]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Disaster & Risk Detection</h1>
          <p className="text-xs text-[var(--color-text-muted)]">Flood, drought, and heat stress monitoring from multi-sensor analysis</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {!satelliteData ? (
          <div className="space-y-6">
            <SharedMap height="h-[50vh]" />
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-8 text-center">
              <Shield className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-4 opacity-40" />
              <p className="text-[var(--color-text-secondary)]">Select a location on the map to assess disaster risk</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Risk Meters Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <RiskMeter level={satelliteData.derived.flood_risk} label="Flood Risk" />
              <RiskMeter level={satelliteData.derived.drought_risk} label="Drought Risk" />
              <RiskMeter level={satelliteData.derived.heat_stress === 'Severe' ? 'High' : satelliteData.derived.heat_stress} label="Heat Stress" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map */}
              <div className="lg:col-span-1">
                <SharedMap height="h-[300px]" showOverlay={false} />
                <div className="mt-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-4">
                  <h4 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Risk Legend</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Low', color: 'var(--color-success)', desc: 'Normal conditions, no action required' },
                      { label: 'Medium', color: 'var(--color-warning)', desc: 'Monitor closely, prepare contingency' },
                      { label: 'High', color: 'var(--color-danger)', desc: 'Take immediate preventive action' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-[var(--color-text-primary)] font-semibold">{item.label}</span>
                        <span className="text-xs text-[var(--color-text-muted)]">- {item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Risk Cards */}
              <div className="lg:col-span-2 space-y-4">
                {risks.map((risk, i) => (
                  <RiskCard key={i} risk={risk} />
                ))}
              </div>
            </div>

            <p className="text-[10px] text-[var(--color-text-muted)]">
              Risk assessment based on satellite data from Google Earth Engine. Near-real-time analysis based on satellite revisit cycles (5-16 days).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisasterRisk;
