import { useState } from 'react';
import { useLocation } from '../context/LocationContext';
import SharedMap from './SharedMap';
import {
  Satellite,
  Eye,
  Radio,
  Thermometer,
  Layers,
  CheckCircle,
  MapPin,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

const satelliteInfo = {
  sentinel2: {
    icon: Eye,
    color: '#10b981',
    fullName: 'Sentinel-2 MSI',
    agency: 'ESA / Copernicus',
    description: 'High-resolution optical imaging for vegetation, land cover, and water quality monitoring.',
    bands: 'B2 (Blue), B3 (Green), B4 (Red), B8 (NIR), B11 (SWIR)',
  },
  landsat8: {
    icon: Thermometer,
    color: '#ef4444',
    fullName: 'Landsat-8 OLI/TIRS',
    agency: 'USGS / NASA',
    description: 'Multispectral and thermal imaging for surface temperature, land use, and vegetation monitoring.',
    bands: 'OLI (Optical), TIRS (Thermal Infrared)',
  },
  sentinel1: {
    icon: Radio,
    color: '#3b82f6',
    fullName: 'Sentinel-1 SAR',
    agency: 'ESA / Copernicus',
    description: 'Synthetic Aperture Radar for all-weather soil moisture, flood detection, and surface deformation.',
    bands: 'VV, VH (C-band SAR)',
  },
  modis: {
    icon: Layers,
    color: '#f59e0b',
    fullName: 'MODIS (Terra/Aqua)',
    agency: 'NASA',
    description: 'High temporal frequency multispectral imaging for fire detection, temperature anomalies, and vegetation dynamics.',
    bands: '36 spectral bands (250m - 1km)',
  },
};

function SatelliteCard({ satKey, data, info }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = info.icon;

  const daysSince = Math.round((Date.now() - new Date(data.last_acquisition).getTime()) / 86400000);

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl overflow-hidden hover:border-[var(--color-border-active)] transition-colors">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: info.color + '15' }}>
            <Icon className="w-5 h-5" style={{ color: info.color }} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{data.satellite}</h3>
            <p className="text-xs text-[var(--color-text-muted)]">{info.agency} | {data.type} | {data.resolution}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-[var(--color-success)]" />
            <span className="text-xs text-[var(--color-success)]">Active</span>
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">{daysSince}d ago</span>
          {expanded ? <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[var(--color-border)] p-4 animate-fade-in">
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">{info.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">Last Acquisition</p>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{data.last_acquisition}</p>
            </div>
            <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">Resolution</p>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{data.resolution}</p>
            </div>
            <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">Revisit Cycle</p>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{data.revisit_cycle}</p>
            </div>
            <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">Bands</p>
              <p className="text-xs text-[var(--color-text-primary)]">{info.bands}</p>
            </div>
          </div>

          {/* Key Metrics */}
          {data.indices && (
            <div className="mb-4">
              <h4 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Vegetation Indices</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(data.indices).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center bg-[var(--color-bg-secondary)] rounded-lg px-3 py-2">
                    <span className="text-xs text-[var(--color-text-muted)] uppercase">{key}</span>
                    <span className="text-sm font-mono font-semibold text-[var(--color-text-primary)]">{val.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.temperature !== undefined && (
            <div className="mb-4">
              <h4 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Temperature</h4>
              <div className="bg-[var(--color-bg-secondary)] rounded-lg px-3 py-2 inline-block">
                <span className="text-sm font-mono font-semibold text-[var(--color-text-primary)]">{data.temperature.toFixed(1)}{'\u00B0'}C</span>
                <span className="text-xs text-[var(--color-text-muted)] ml-2">Surface temperature</span>
              </div>
            </div>
          )}

          {data.polarization && (
            <div className="mb-4">
              <h4 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">SAR Polarization</h4>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(data.polarization).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center bg-[var(--color-bg-secondary)] rounded-lg px-3 py-2">
                    <span className="text-xs text-[var(--color-text-muted)]">{key}</span>
                    <span className="text-sm font-mono font-semibold text-[var(--color-text-primary)]">{val.toFixed(2)} dB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.soil_moisture_estimate !== undefined && (
            <div className="mb-4">
              <h4 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Soil Moisture</h4>
              <div className="bg-[var(--color-bg-secondary)] rounded-lg px-3 py-2 inline-block">
                <span className="text-sm font-mono font-semibold text-[var(--color-text-primary)]">{data.soil_moisture_estimate.toFixed(1)}%</span>
                <span className="text-xs text-[var(--color-text-muted)] ml-2">SAR-derived estimate</span>
              </div>
            </div>
          )}

          {/* Data Quality */}
          {data.quality && (
            <div>
              <h4 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Data Quality</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(data.quality).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center bg-[var(--color-bg-secondary)] rounded-lg px-3 py-2">
                    <span className="text-xs text-[var(--color-text-muted)] capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                      {typeof val === 'number' ? `${val.toFixed(1)}%` : val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interpretation */}
          <div className="mt-4 bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 rounded-lg p-3">
            <p className="text-xs text-[var(--color-accent-light)] font-semibold mb-1">Interpretation</p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {getInterpretation(satKey, data)}
            </p>
          </div>

          <p className="text-[10px] text-[var(--color-text-muted)] mt-3">
            Data sourced from {data.satellite} via Google Earth Engine. Last updated {daysSince} day{daysSince !== 1 ? 's' : ''} ago.
          </p>
        </div>
      )}
    </div>
  );
}

function getInterpretation(key, data) {
  switch (key) {
    case 'sentinel2': {
      const ndvi = data.indices?.ndvi || 0;
      if (ndvi > 0.6) return `Strong vegetation signal detected. NDVI of ${ndvi.toFixed(3)} indicates healthy, dense vegetation cover. This is consistent with active cropland or forest.`;
      if (ndvi > 0.3) return `Moderate vegetation detected. NDVI of ${ndvi.toFixed(3)} suggests active but not peak vegetation. Could indicate early/late season crops or sparse natural vegetation.`;
      return `Low vegetation signal. NDVI of ${ndvi.toFixed(3)} indicates bare soil, water bodies, or dormant/harvested cropland.`;
    }
    case 'landsat8': {
      const temp = data.temperature || 25;
      if (temp > 38) return `High surface temperature of ${temp.toFixed(1)}\u00B0C detected. This may indicate heat stress conditions for vegetation and increased evapotranspiration rates.`;
      if (temp > 30) return `Warm surface conditions at ${temp.toFixed(1)}\u00B0C. Within normal range for tropical/subtropical regions during growing season.`;
      return `Surface temperature of ${temp.toFixed(1)}\u00B0C is within comfortable range for most vegetation types.`;
    }
    case 'sentinel1': {
      const moisture = data.soil_moisture_estimate || 30;
      if (moisture > 70) return `High soil moisture detected (${moisture.toFixed(0)}%). SAR backscatter indicates potential waterlogging or recent precipitation. Monitor for flood risk.`;
      if (moisture > 40) return `Adequate soil moisture at ${moisture.toFixed(0)}%. SAR analysis shows healthy soil hydration supporting vegetation growth.`;
      return `Low soil moisture at ${moisture.toFixed(0)}%. SAR data suggests dry conditions that may require irrigation for crop support.`;
    }
    case 'modis':
      return `${data.fire_detection}. ${data.anomaly}. MODIS provides daily coverage at 250m-1km resolution for rapid change detection.`;
    default:
      return 'Data available for analysis.';
  }
}

const SatelliteExplorer = () => {
  const { satelliteData } = useLocation();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Satellite Explorer</h1>
          <p className="text-xs text-[var(--color-text-muted)]">Transparency & trust: see exactly what each satellite provides</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {!satelliteData ? (
          <div className="space-y-6">
            <SharedMap height="h-[50vh]" />
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-8 text-center">
              <Satellite className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-4 opacity-40" />
              <p className="text-[var(--color-text-secondary)]">Select a location on the map to view detailed satellite data</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <SharedMap height="h-[300px]" showOverlay={false} />
            </div>
            <div className="lg:col-span-2 space-y-3">
              {Object.entries(satelliteData.satellites).map(([key, data]) => (
                <SatelliteCard
                  key={key}
                  satKey={key}
                  data={data}
                  info={satelliteInfo[key]}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SatelliteExplorer;
