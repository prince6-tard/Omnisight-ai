export interface Location {
  lat: number
  lon: number
  name?: string
}

export interface SatelliteIndices {
  ndvi: number
  evi?: number
  ndwi?: number
  savi?: number
}

export interface SatelliteQuality {
  cloud_cover: number
  data_quality: string
}

export interface SentinelTwoData {
  satellite: string
  resolution: string
  indices: SatelliteIndices
  quality: SatelliteQuality
  timestamp: string
  status: "success" | "fallback"
  bands?: Record<string, number>
}

export interface LandsatData {
  satellite: string
  resolution: string
  temperature: number
  thermal_band?: number
  indices: { ndvi: number }
  quality: SatelliteQuality
  timestamp: string
  status: "success" | "fallback"
}

export interface SentinelOneData {
  satellite: string
  resolution: string
  type: string
  polarization: {
    VV: number
    VH: number
    ratio: number
  }
  soil_moisture_estimate: number
  timestamp: string
  status: "success" | "fallback"
}

export interface ModisData {
  satellite: string
  resolution: string
  temperature: {
    day: number
    night: number
    range: number
  }
  timestamp: string
  status: "success" | "fallback"
}

export interface AllSatelliteData {
  location: Location
  fetch_time: string
  satellites: {
    sentinel2: SentinelTwoData
    landsat8: LandsatData
    sentinel1: SentinelOneData
    modis: ModisData
  }
  summary: {
    total_satellites: number
    active_satellites: number
    satellites_status: Record<string, string>
    best_resolution: string
    data_quality: string
    overall_confidence: number
    last_update: string
  }
}

export interface CropHealthResult {
  crop_detected: boolean
  vegetation_health_score: number
  health_category: "Poor" | "Moderate" | "Healthy"
  likely_crop_category: string
  yield_estimate?: string
  ndvi: number
  confidence: number
  recommendations: string[]
  satellite_source: string
  last_update: string
}

export interface DisasterRisk {
  type: string
  level: "Low" | "Medium" | "High"
  probability: number
  severity_explanation: string
  time_sensitivity: "Immediate" | "Watch" | "Normal"
  preventive_advice: string[]
}

export interface DisasterRiskResult {
  detected_risks: DisasterRisk[]
  overall_risk_level: "Low" | "Medium" | "High"
  confidence: number
  satellite_source: string
  last_update: string
}

export interface FusionSource {
  satellite: string
  weight: number
  value: number
}

export interface FusedMetric {
  value: number
  confidence: number
  sources: FusionSource[]
  agreement: "High" | "Medium" | "Low"
  variance: number
}

export interface DataFusionResult {
  fused_metrics: {
    ndvi?: FusedMetric
    temperature?: FusedMetric
    soil_moisture?: FusedMetric
    evi?: FusedMetric
  }
  overall_confidence: number
  consensus_level: "High" | "Medium" | "Low"
  overall_quality: string
  data_sources: string[]
  timestamp: string
}

export interface AISummary {
  what_is_happening: string
  why_is_it_happening: string
  what_should_be_done: string
  confidence: number
}
