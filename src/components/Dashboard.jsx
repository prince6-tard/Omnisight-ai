import { Activity, MapPin, Layers, CloudRain, Thermometer, Droplets, Leaf, AlertTriangle, Clock, Satellite } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import SharedMap from './SharedMap';

const MetricCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 rounded-xl hover:border-[var(--color-border-active)] transition-colors">
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2 rounded-lg`} style={{ backgroundColor: color + '15' }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
    </div>
    <p className="text-xs text-[var(--color-text-muted)] mb-1">{title}</p>
    <h3 className="text-xl font-bold text-[var(--color-text-primary)]">{value}</h3>
    {subtitle && <p className="text-xs text-[var(--color-text-muted)] mt-1">{subtitle}</p>}
  </div>
);

function AISummary({ data }) {
  if (!data) return null;
  const d = data.derived;
  const s = data.satellites;

  const ndvi = s.sentinel2.indices.ndvi;
  const temp = s.landsat8.temperature;
  const moisture = d.soil_moisture;

  // Generate contextual analysis
  let situation = '';
  if (ndvi > 0.5 && temp < 35) {
    situation = `Healthy vegetation detected with strong NDVI readings (${ndvi.toFixed(3)}). Surface temperature is within normal range at ${temp.toFixed(1)}\u00B0C. Soil moisture at ${moisture.toFixed(0)}% supports active crop growth.`;
  } else if (ndvi < 0.2) {
    situation = `Low vegetation cover detected (NDVI: ${ndvi.toFixed(3)}). This may indicate bare soil, post-harvest conditions, or vegetation stress. Surface temperature reads ${temp.toFixed(1)}\u00B0C.`;
  } else {
    situation = `Moderate vegetation activity detected (NDVI: ${ndvi.toFixed(3)}). Surface temperature at ${temp.toFixed(1)}\u00B0C with soil moisture at ${moisture.toFixed(0)}%. Conditions suggest ${d.estimated_crop}.`;
  }

  let why = '';
  if (d.drought_risk === 'High') why = 'Low soil moisture combined with reduced vegetation indices suggests drought conditions affecting the area.';
  else if (d.flood_risk === 'High') why = 'Elevated soil moisture from SAR analysis indicates potential waterlogging or flood risk in the region.';
  else if (d.heat_stress !== 'Low') why = `Above-normal surface temperatures (${temp.toFixed(1)}\u00B0C) from Landsat-8 thermal bands indicate heat stress conditions.`;
  else why = 'Multi-satellite cross-validation shows consistent readings across optical, SAR, and thermal sensors, indicating stable conditions.';

  let action = '';
  if (d.flood_risk === 'High') action = 'Immediate: Monitor drainage systems. Consider protective measures for low-lying crops.';
  else if (d.drought_risk === 'High') action = 'Recommend increased irrigation scheduling. Monitor soil moisture trends over next satellite pass.';
  else if (d.heat_stress !== 'Low') action = 'Consider shade net deployment for sensitive crops. Schedule irrigation during cooler hours.';
  else action = 'Continue standard monitoring. Next satellite update expected within 5 days.';

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 animate-fade-in">
      <h3 className="text-sm font-semibold text-[var(--color-accent-light)] mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4" />
        AI Situation Summary
      </h3>
      <div className="space-y-4 text-sm">
        <div>
          <p className="text-[var(--color-text-muted)] text-xs uppercase tracking-wide mb-1">What is happening?</p>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">{situation}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-muted)] text-xs uppercase tracking-wide mb-1">Why is it happening?</p>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">{why}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-muted)] text-xs uppercase tracking-wide mb-1">What should be done?</p>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">{action}</p>
        </div>
        <div className="flex items-center gap-4 pt-2 border-t border-[var(--color-border)]">
          <span className="text-xs text-[var(--color-text-muted)]">
            Confidence: <span className="text-[var(--color-success)] font-semibold">{data.summary.confidence}%</span>
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">
            Sources: {data.fusion.data_sources.join(', ')}
          </span>
        </div>
      </div>
    </div>
  );
}

const Dashboard = () => {
  const { location, satelliteData, loading } = useLocation();

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex-shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Live Dashboard</h1>
          {location && (
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                <MapPin className="w-3.5 h-3.5 text-[var(--color-accent-light)]" />
                {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
              </span>
              {satelliteData && (
                <>
                  <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                    <Satellite className="w-3.5 h-3.5 text-[var(--color-success)]" />
                    {satelliteData.summary.active_satellites}/{satelliteData.summary.total_satellites} Active
                  </span>
                  <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(satelliteData.timestamp).toLocaleString()}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
        {satelliteData && (
          <div className="flex items-center gap-2 text-xs bg-[var(--color-bg-card)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
            <span className="text-[var(--color-text-muted)]">Overall Confidence</span>
            <span className="font-bold text-[var(--color-success)]">{satelliteData.summary.confidence}%</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {!satelliteData ? (
          <div className="h-full flex flex-col">
            <SharedMap height="h-[60vh]" />
            <div className="mt-6 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-8 text-center">
              <MapPin className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-4 opacity-40" />
              <p className="text-[var(--color-text-secondary)]">Select a location on the map to begin satellite analysis</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">Click anywhere to fetch data from Sentinel-2, Landsat-8, Sentinel-1, and MODIS</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <MetricCard
                title="NDVI"
                value={satelliteData.satellites.sentinel2.indices.ndvi.toFixed(3)}
                icon={Leaf}
                color="#10b981"
                subtitle={satelliteData.derived.vegetation_health}
              />
              <MetricCard
                title="Surface Temp"
                value={`${satelliteData.satellites.landsat8.temperature.toFixed(1)}\u00B0C`}
                icon={Thermometer}
                color="#ef4444"
                subtitle={satelliteData.derived.heat_stress + ' stress'}
              />
              <MetricCard
                title="Soil Moisture"
                value={`${satelliteData.derived.soil_moisture.toFixed(0)}%`}
                icon={Droplets}
                color="#3b82f6"
                subtitle="SAR-derived"
              />
              <MetricCard
                title="Flood Risk"
                value={satelliteData.derived.flood_risk}
                icon={CloudRain}
                color={satelliteData.derived.flood_risk === 'High' ? '#ef4444' : satelliteData.derived.flood_risk === 'Medium' ? '#f59e0b' : '#10b981'}
                subtitle="Sentinel-1 SAR"
              />
              <MetricCard
                title="Drought Risk"
                value={satelliteData.derived.drought_risk}
                icon={AlertTriangle}
                color={satelliteData.derived.drought_risk === 'High' ? '#ef4444' : satelliteData.derived.drought_risk === 'Medium' ? '#f59e0b' : '#10b981'}
                subtitle="Multi-sensor"
              />
              <MetricCard
                title="Veg Score"
                value={`${satelliteData.derived.vegetation_score}/100`}
                icon={Activity}
                color="#8b5cf6"
                subtitle={satelliteData.derived.estimated_crop}
              />
            </div>

            {/* Map + AI Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SharedMap height="h-[400px]" />
              </div>
              <div>
                <AISummary data={satelliteData} />
              </div>
            </div>

            {/* Satellite Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(satelliteData.satellites).map(([key, sat]) => (
                <div key={key} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{sat.satellite.split(' ')[0]}</h4>
                    <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">{sat.type} | {sat.resolution}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Last: {sat.last_acquisition} | Revisit: {sat.revisit_cycle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
