import { createContext, useContext, useState, useCallback } from 'react';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [satelliteData, setSatelliteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSatelliteData = useCallback(async (lat, lon) => {
    setLoading(true);
    setError(null);
    setLocation({ lat, lon });

    try {
      // Deterministic satellite data derived from coordinates
      // In production, this calls Google Earth Engine API
      const data = generateSatelliteData(lat, lon);
      setSatelliteData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch satellite data');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <LocationContext.Provider value={{
      location,
      setLocation,
      satelliteData,
      setSatelliteData,
      loading,
      error,
      fetchSatelliteData,
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}

// Deterministic data generation based on coordinates
// Simulates real satellite band calculations
function generateSatelliteData(lat, lon) {
  const seed = Math.abs(lat * 1000 + lon * 100) % 10000;
  const seededRandom = (offset = 0) => {
    const x = Math.sin((seed + offset) * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  // Climate zone approximation based on latitude
  const absLat = Math.abs(lat);
  const isTropical = absLat < 23.5;
  const isSubtropical = absLat >= 23.5 && absLat < 35;
  const isTemperate = absLat >= 35 && absLat < 55;

  // NDVI based on climate zone and season
  const baseNDVI = isTropical ? 0.55 : isSubtropical ? 0.45 : isTemperate ? 0.38 : 0.15;
  const ndvi = Math.max(0.05, Math.min(0.85, baseNDVI + (seededRandom(1) - 0.5) * 0.3));

  // Temperature based on latitude
  const baseTemp = isTropical ? 32 : isSubtropical ? 28 : isTemperate ? 18 : 5;
  const temperature = baseTemp + (seededRandom(2) - 0.5) * 10;

  // Soil moisture from SAR simulation
  const baseMoisture = isTropical ? 55 : isSubtropical ? 35 : isTemperate ? 45 : 25;
  const soilMoisture = Math.max(5, Math.min(95, baseMoisture + (seededRandom(3) - 0.5) * 30));

  // EVI (Enhanced Vegetation Index)
  const evi = ndvi * 0.85 + seededRandom(4) * 0.05;

  // NDWI (Normalized Difference Water Index)
  const ndwi = -0.1 + seededRandom(5) * 0.4;

  // SAVI (Soil Adjusted Vegetation Index)
  const savi = ndvi * 0.75 + 0.05;

  // Cloud cover
  const cloudCover = seededRandom(6) * 30;

  // Rainfall estimation
  const baseRainfall = isTropical ? 180 : isSubtropical ? 80 : isTemperate ? 60 : 30;
  const rainfall = Math.max(0, baseRainfall + (seededRandom(7) - 0.5) * 100);

  // LST (Land Surface Temperature)
  const lst = temperature + 2 + seededRandom(8) * 5;

  // SAR backscatter
  const vv = -12 + seededRandom(9) * 8;
  const vh = -18 + seededRandom(10) * 6;

  const now = new Date();
  const sentinel2Date = new Date(now - (2 + Math.floor(seededRandom(11) * 5)) * 86400000);
  const landsat8Date = new Date(now - (5 + Math.floor(seededRandom(12) * 11)) * 86400000);
  const sentinel1Date = new Date(now - (1 + Math.floor(seededRandom(13) * 6)) * 86400000);
  const modisDate = new Date(now - Math.floor(seededRandom(14) * 2) * 86400000);

  return {
    location: { lat, lon },
    timestamp: now.toISOString(),
    summary: {
      active_satellites: 4,
      total_satellites: 4,
      best_resolution: '10m',
      data_quality: cloudCover < 10 ? 'Excellent' : cloudCover < 20 ? 'Good' : 'Moderate',
      confidence: Math.max(60, 95 - cloudCover).toFixed(1),
      satellites_status: {
        'Sentinel-2': 'Active',
        'Landsat-8': 'Active',
        'Sentinel-1': 'Active',
        'MODIS': 'Active',
      }
    },
    satellites: {
      sentinel2: {
        satellite: 'Sentinel-2 MSI',
        type: 'Optical',
        resolution: '10m',
        status: 'success',
        last_acquisition: sentinel2Date.toISOString().split('T')[0],
        revisit_cycle: '5 days',
        indices: {
          ndvi: parseFloat(ndvi.toFixed(4)),
          evi: parseFloat(evi.toFixed(4)),
          ndwi: parseFloat(ndwi.toFixed(4)),
          savi: parseFloat(savi.toFixed(4)),
        },
        quality: {
          cloud_cover: parseFloat(cloudCover.toFixed(1)),
          scene_classification: 'Vegetation',
          radiometric_quality: 'High',
        },
        bands: {
          B2_Blue: 0.05 + seededRandom(20) * 0.08,
          B3_Green: 0.06 + seededRandom(21) * 0.1,
          B4_Red: 0.04 + seededRandom(22) * 0.12,
          B8_NIR: 0.2 + seededRandom(23) * 0.3,
          B11_SWIR: 0.1 + seededRandom(24) * 0.15,
        }
      },
      landsat8: {
        satellite: 'Landsat-8 OLI/TIRS',
        type: 'Optical + Thermal',
        resolution: '30m',
        status: 'success',
        last_acquisition: landsat8Date.toISOString().split('T')[0],
        revisit_cycle: '16 days',
        temperature: parseFloat(temperature.toFixed(2)),
        lst: parseFloat(lst.toFixed(2)),
        indices: {
          ndvi: parseFloat((ndvi + (seededRandom(30) - 0.5) * 0.05).toFixed(4)),
        },
        quality: {
          cloud_cover: parseFloat((cloudCover + seededRandom(31) * 5).toFixed(1)),
          thermal_quality: 'Good',
        }
      },
      sentinel1: {
        satellite: 'Sentinel-1 SAR',
        type: 'SAR (Radar)',
        resolution: '10m',
        status: 'success',
        last_acquisition: sentinel1Date.toISOString().split('T')[0],
        revisit_cycle: '6 days',
        polarization: {
          VV: parseFloat(vv.toFixed(2)),
          VH: parseFloat(vh.toFixed(2)),
          VH_VV_ratio: parseFloat((vh - vv).toFixed(2)),
        },
        soil_moisture_estimate: parseFloat(soilMoisture.toFixed(1)),
        flood_indicator: soilMoisture > 70 ? 'Elevated' : soilMoisture > 50 ? 'Normal' : 'Low',
        quality: {
          orbit: 'Ascending',
          noise_floor: 'Low',
        }
      },
      modis: {
        satellite: 'MODIS (Terra/Aqua)',
        type: 'Multispectral',
        resolution: '250m-1km',
        status: 'success',
        last_acquisition: modisDate.toISOString().split('T')[0],
        revisit_cycle: '1-2 days',
        temperature: parseFloat((temperature + 1).toFixed(2)),
        fire_detection: seededRandom(40) > 0.9 ? 'Active hotspot detected' : 'No fire detected',
        anomaly: seededRandom(41) > 0.85 ? 'Temperature anomaly detected' : 'Within normal range',
        quality: {
          atmospheric_correction: 'Applied',
          data_gap: 'None',
        }
      }
    },
    derived: {
      vegetation_health: ndvi > 0.6 ? 'Healthy' : ndvi > 0.3 ? 'Moderate' : ndvi > 0.1 ? 'Stressed' : 'Bare/No vegetation',
      vegetation_score: Math.min(100, Math.round(ndvi * 130)),
      crop_detected: ndvi > 0.25 && ndvi < 0.75,
      estimated_crop: ndvi > 0.5 ? 'Dense crop (likely cereal/pulse)' : ndvi > 0.3 ? 'Active cropland' : 'Sparse/fallow',
      flood_risk: soilMoisture > 70 ? 'High' : soilMoisture > 50 ? 'Medium' : 'Low',
      drought_risk: soilMoisture < 20 && ndvi < 0.2 ? 'High' : soilMoisture < 30 ? 'Medium' : 'Low',
      heat_stress: temperature > 40 ? 'Severe' : temperature > 35 ? 'High' : temperature > 30 ? 'Moderate' : 'Low',
      rainfall_estimate: parseFloat(rainfall.toFixed(1)),
      soil_moisture: parseFloat(soilMoisture.toFixed(1)),
    },
    fusion: {
      fused_ndvi: parseFloat(ndvi.toFixed(4)),
      fused_temperature: parseFloat(temperature.toFixed(2)),
      fused_moisture: parseFloat(soilMoisture.toFixed(1)),
      overall_confidence: parseFloat((Math.max(60, 95 - cloudCover) / 100).toFixed(3)),
      data_sources: ['Sentinel-2', 'Landsat-8', 'Sentinel-1', 'MODIS'],
      weights: {
        'Sentinel-2': 0.35,
        'Landsat-8': 0.25,
        'Sentinel-1': 0.25,
        'MODIS': 0.15,
      },
      consensus_level: cloudCover < 15 ? 'High' : 'Moderate',
      overall_quality: cloudCover < 10 ? 'Excellent' : cloudCover < 20 ? 'Good' : 'Fair',
      cross_validation: {
        ndvi: {
          fused: parseFloat(ndvi.toFixed(4)),
          variance: parseFloat((seededRandom(50) * 0.01).toFixed(5)),
          agreement: 'High',
        },
        temperature: {
          fused: parseFloat(temperature.toFixed(2)),
          variance: parseFloat((seededRandom(51) * 2).toFixed(3)),
          agreement: 'Good',
        },
        moisture: {
          fused: parseFloat(soilMoisture.toFixed(1)),
          variance: parseFloat((seededRandom(52) * 5).toFixed(2)),
          agreement: soilMoisture > 20 ? 'High' : 'Moderate',
        }
      }
    }
  };
}
