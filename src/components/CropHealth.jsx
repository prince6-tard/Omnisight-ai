import { useState, useMemo } from 'react';
import { useLocation } from '../context/LocationContext';
import SharedMap from './SharedMap';
import {
  Leaf,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Droplets,
  Thermometer,
  Sun,
  Sprout,
  BarChart3,
} from 'lucide-react';

function HealthGauge({ score, label }) {
  const color = score > 70 ? 'var(--color-success)' : score > 40 ? 'var(--color-warning)' : 'var(--color-danger)';
  const pct = Math.min(100, Math.max(0, score));

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="42" fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${pct * 2.64} 264`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[var(--color-text-primary)]">{score}</span>
          <span className="text-[10px] text-[var(--color-text-muted)]">/100</span>
        </div>
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mt-2">{label}</p>
    </div>
  );
}

function NDVIBar({ ndvi }) {
  const pct = Math.min(100, Math.max(0, ndvi * 100));
  const getCategory = () => {
    if (ndvi < 0.1) return { label: 'No vegetation', color: '#6b7280' };
    if (ndvi < 0.3) return { label: 'Sparse vegetation', color: '#f59e0b' };
    if (ndvi < 0.6) return { label: 'Cropland', color: '#10b981' };
    return { label: 'Dense crop/forest', color: '#059669' };
  };
  const cat = getCategory();

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-[var(--color-text-muted)]">NDVI: {ndvi.toFixed(4)}</span>
        <span className="text-xs font-semibold" style={{ color: cat.color }}>{cat.label}</span>
      </div>
      <div className="w-full h-2 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
      </div>
      <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-1">
        <span>0</span>
        <span>{'<'}0.1 Bare</span>
        <span>0.3 Sparse</span>
        <span>0.6 Crop</span>
        <span>1.0</span>
      </div>
    </div>
  );
}

const CropHealth = () => {
  const { satelliteData, location } = useLocation();
  const [cropType, setCropType] = useState('Wheat');
  const [farmArea, setFarmArea] = useState(10);

  const analysis = useMemo(() => {
    if (!satelliteData) return null;
    const ndvi = satelliteData.satellites.sentinel2.indices.ndvi;
    const evi = satelliteData.satellites.sentinel2.indices.evi;
    const temp = satelliteData.satellites.landsat8.temperature;
    const moisture = satelliteData.derived.soil_moisture;
    const vegScore = satelliteData.derived.vegetation_score;

    // Crop detection logic based on NDVI thresholds
    const cropDetected = ndvi > 0.25 && ndvi < 0.75;
    let healthCategory = 'Poor';
    if (vegScore > 70) healthCategory = 'Healthy';
    else if (vegScore > 40) healthCategory = 'Moderate';

    // Yield estimation (simplified model based on NDVI + temperature + moisture)
    const baseYield = { Wheat: 4.5, Rice: 5.0, Corn: 8.0, Soybean: 3.0, Cotton: 2.5, Sugarcane: 70 };
    const cropBase = baseYield[cropType] || 4.5;
    const ndviMultiplier = Math.max(0.3, Math.min(1.3, ndvi * 2));
    const tempPenalty = temp > 38 ? 0.8 : temp > 35 ? 0.9 : 1.0;
    const moistureBonus = moisture > 40 && moisture < 70 ? 1.05 : moisture < 20 ? 0.75 : 1.0;
    const yieldEstimate = (cropBase * ndviMultiplier * tempPenalty * moistureBonus).toFixed(2);
    const totalYield = (yieldEstimate * farmArea).toFixed(1);

    // Problem detection
    const problems = [];
    if (ndvi < 0.3 && cropDetected) problems.push({ type: 'Vegetation Stress', severity: 'High', cause: 'Low NDVI indicates possible pest damage, nutrient deficiency, or water stress.' });
    if (temp > 35) problems.push({ type: 'Heat Stress', severity: temp > 40 ? 'Severe' : 'Moderate', cause: `Surface temperature of ${temp.toFixed(1)}\u00B0C exceeds optimal range for ${cropType}.` });
    if (moisture < 25) problems.push({ type: 'Water Deficit', severity: 'High', cause: `Soil moisture at ${moisture.toFixed(0)}% is below critical threshold for active crop growth.` });
    if (moisture > 75) problems.push({ type: 'Waterlogging Risk', severity: 'Moderate', cause: `High soil moisture (${moisture.toFixed(0)}%) may impair root respiration.` });

    // AI Recommendations
    const recommendations = [];
    if (moisture < 30) recommendations.push('Increase irrigation frequency. Consider drip irrigation for water efficiency.');
    if (temp > 35) recommendations.push('Apply mulch to reduce soil temperature. Schedule watering during early morning.');
    if (ndvi < 0.4 && cropDetected) recommendations.push('Conduct soil nutrient analysis. Consider foliar feeding for quick recovery.');
    if (problems.length === 0) recommendations.push('Continue standard monitoring. Conditions are favorable for crop growth.');
    recommendations.push(`Next satellite update for this location: ~${satelliteData.satellites.sentinel2.revisit_cycle}.`);

    return {
      cropDetected,
      healthCategory,
      vegScore,
      ndvi,
      evi,
      yieldEstimate,
      totalYield,
      problems,
      recommendations,
      confidence: satelliteData.summary.confidence,
      source: 'Sentinel-2 via Google Earth Engine',
      lastUpdate: satelliteData.satellites.sentinel2.last_acquisition,
    };
  }, [satelliteData, cropType, farmArea]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Crop Health Monitor</h1>
          <p className="text-xs text-[var(--color-text-muted)]">NDVI-based crop detection, health scoring, and yield estimation</p>
        </div>
        {analysis && (
          <div className="flex items-center gap-2 text-xs bg-[var(--color-bg-card)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
            <span className="text-[var(--color-text-muted)]">Source:</span>
            <span className="text-[var(--color-text-primary)]">{analysis.source}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6">
        {!satelliteData ? (
          <div className="space-y-6">
            <SharedMap height="h-[50vh]" />
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-8 text-center">
              <Sprout className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-4 opacity-40" />
              <p className="text-[var(--color-text-secondary)]">Select a location on the map to analyze crop health</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Config Panel */}
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Configuration</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] block mb-1">Crop Type</label>
                    <select
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                      className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
                    >
                      {['Wheat', 'Rice', 'Corn', 'Soybean', 'Cotton', 'Sugarcane'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] block mb-1">Farm Area (hectares)</label>
                    <input
                      type="number"
                      value={farmArea}
                      onChange={(e) => setFarmArea(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <SharedMap height="h-[180px]" showOverlay={false} />
                </div>
              </div>

              {/* Main Results */}
              <div className="lg:col-span-3 space-y-6">
                {/* Health Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 flex items-center justify-center">
                    <HealthGauge score={analysis.vegScore} label="Vegetation Health Score" />
                  </div>
                  <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      {analysis.cropDetected ? (
                        <CheckCircle className="w-4 h-4 text-[var(--color-success)]" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-[var(--color-warning)]" />
                      )}
                      <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Crop {analysis.cropDetected ? 'Detected' : 'Not Detected'}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)]">Health</span>
                        <span className={`font-semibold ${analysis.healthCategory === 'Healthy' ? 'text-[var(--color-success)]' : analysis.healthCategory === 'Moderate' ? 'text-[var(--color-warning)]' : 'text-[var(--color-danger)]'}`}>
                          {analysis.healthCategory}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)]">Category</span>
                        <span className="text-[var(--color-text-primary)]">{satelliteData.derived.estimated_crop}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)]">Confidence</span>
                        <span className="text-[var(--color-success)]">{analysis.confidence}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-4 h-4 text-[var(--color-accent-light)]" />
                      <span className="text-sm font-semibold text-[var(--color-text-primary)]">Yield Estimate</span>
                    </div>
                    <div className="text-center py-2">
                      <p className="text-3xl font-bold text-[var(--color-text-primary)]">{analysis.yieldEstimate}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">tonnes/hectare</p>
                    </div>
                    {farmArea > 0 && (
                      <div className="border-t border-[var(--color-border)] pt-2 mt-2 text-center">
                        <p className="text-lg font-bold text-[var(--color-accent-light)]">{analysis.totalYield} t</p>
                        <p className="text-xs text-[var(--color-text-muted)]">total for {farmArea} ha</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* NDVI Bar */}
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[var(--color-success)]" />
                    NDVI Analysis
                  </h3>
                  <NDVIBar ndvi={analysis.ndvi} />
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    <div className="bg-[var(--color-bg-secondary)] rounded-lg p-2 text-center">
                      <p className="text-xs text-[var(--color-text-muted)]">NDVI</p>
                      <p className="text-sm font-mono font-bold text-[var(--color-success)]">{analysis.ndvi.toFixed(4)}</p>
                    </div>
                    <div className="bg-[var(--color-bg-secondary)] rounded-lg p-2 text-center">
                      <p className="text-xs text-[var(--color-text-muted)]">EVI</p>
                      <p className="text-sm font-mono font-bold text-[var(--color-text-primary)]">{analysis.evi.toFixed(4)}</p>
                    </div>
                    <div className="bg-[var(--color-bg-secondary)] rounded-lg p-2 text-center">
                      <p className="text-xs text-[var(--color-text-muted)]">Temp</p>
                      <p className="text-sm font-mono font-bold text-[var(--color-text-primary)]">{satelliteData.satellites.landsat8.temperature.toFixed(1)}{'\u00B0'}C</p>
                    </div>
                    <div className="bg-[var(--color-bg-secondary)] rounded-lg p-2 text-center">
                      <p className="text-xs text-[var(--color-text-muted)]">Moisture</p>
                      <p className="text-sm font-mono font-bold text-[var(--color-text-primary)]">{satelliteData.derived.soil_moisture.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>

                {/* Problems */}
                {analysis.problems.length > 0 && (
                  <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-[var(--color-warning)] mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Problem Zones Detected
                    </h3>
                    <div className="space-y-3">
                      {analysis.problems.map((p, i) => (
                        <div key={i} className="bg-[var(--color-bg-secondary)] rounded-lg p-3 border-l-2" style={{ borderColor: p.severity === 'Severe' ? 'var(--color-danger)' : p.severity === 'High' ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-semibold text-[var(--color-text-primary)]">{p.type}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${p.severity === 'Severe' || p.severity === 'High' ? 'bg-red-500/10 text-[var(--color-danger)]' : 'bg-yellow-500/10 text-[var(--color-warning)]'}`}>
                              {p.severity}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--color-text-secondary)]">{p.cause}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Recommendations */}
                <div className="bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-[var(--color-accent-light)] mb-3">AI Recommendations</h3>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-light)] mt-1.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Data source footer */}
                <p className="text-[10px] text-[var(--color-text-muted)]">
                  Data sourced from {analysis.source}. Last updated: {analysis.lastUpdate}. Update frequency: {satelliteData.satellites.sentinel2.revisit_cycle}.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropHealth;
