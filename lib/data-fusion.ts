/**
 * Multi-Satellite Data Fusion Engine
 * Combines data from multiple satellites with weighted averaging,
 * cross-validation, and confidence scoring.
 */

import type { AllSatelliteData, DataFusionResult, FusedMetric, FusionSource } from "./types"

const SATELLITE_WEIGHTS: Record<string, number> = {
  sentinel2: 0.95,
  landsat8: 0.85,
  sentinel1: 0.80,
  modis: 0.60,
}

function calculateConfidence(numSources: number, variance: number, maxVariance: number): number {
  const sourceConf = Math.min(numSources / 4.0, 1.0)
  const varianceConf = Math.max(0, 1.0 - variance / maxVariance)
  return Math.min(1.0, Math.max(0, sourceConf * 0.6 + varianceConf * 0.4))
}

function fuseNDVI(data: AllSatelliteData): FusedMetric | null {
  const sources: FusionSource[] = []

  const s2ndvi = data.satellites.sentinel2?.indices?.ndvi
  if (s2ndvi !== undefined) {
    sources.push({ satellite: "Sentinel-2", weight: SATELLITE_WEIGHTS.sentinel2, value: s2ndvi })
  }

  const l8ndvi = data.satellites.landsat8?.indices?.ndvi
  if (l8ndvi !== undefined) {
    sources.push({ satellite: "Landsat-8", weight: SATELLITE_WEIGHTS.landsat8, value: l8ndvi })
  }

  if (sources.length === 0) return null

  const totalWeight = sources.reduce((sum, s) => sum + s.weight, 0)
  const fusedValue = sources.reduce((sum, s) => sum + s.value * s.weight, 0) / totalWeight
  const values = sources.map((s) => s.value)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.length > 1 ? values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length : 0
  const confidence = calculateConfidence(sources.length, variance, 0.04)

  return {
    value: Math.round(fusedValue * 1000) / 1000,
    confidence: Math.round(confidence * 100) / 100,
    sources,
    agreement: variance < 0.02 ? "High" : variance < 0.05 ? "Medium" : "Low",
    variance: Math.round(variance * 10000) / 10000,
  }
}

function fuseTemperature(data: AllSatelliteData): FusedMetric | null {
  const sources: FusionSource[] = []

  const l8temp = data.satellites.landsat8?.temperature
  if (l8temp !== undefined && l8temp > -50 && l8temp < 60) {
    sources.push({ satellite: "Landsat-8", weight: SATELLITE_WEIGHTS.landsat8, value: l8temp })
  }

  const modisTemp = data.satellites.modis?.temperature
  if (modisTemp && typeof modisTemp === "object" && "day" in modisTemp) {
    const avgTemp = (modisTemp.day + modisTemp.night) / 2
    sources.push({ satellite: "MODIS", weight: SATELLITE_WEIGHTS.modis, value: avgTemp })
  }

  if (sources.length === 0) return null

  const totalWeight = sources.reduce((sum, s) => sum + s.weight, 0)
  const fusedValue = sources.reduce((sum, s) => sum + s.value * s.weight, 0) / totalWeight
  const values = sources.map((s) => s.value)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.length > 1 ? values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length : 0
  const confidence = calculateConfidence(sources.length, variance, 4.0)

  return {
    value: Math.round(fusedValue * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    sources,
    agreement: variance < 1.0 ? "High" : variance < 3.0 ? "Medium" : "Low",
    variance: Math.round(variance * 100) / 100,
  }
}

function fuseMoisture(data: AllSatelliteData): FusedMetric | null {
  const moisture = data.satellites.sentinel1?.soil_moisture_estimate
  if (moisture === undefined) return null

  return {
    value: Math.round(moisture * 10) / 10,
    confidence: 0.75,
    sources: [{ satellite: "Sentinel-1 (SAR)", weight: SATELLITE_WEIGHTS.sentinel1, value: moisture }],
    agreement: "High",
    variance: 0,
  }
}

function fuseEVI(data: AllSatelliteData): FusedMetric | null {
  const evi = data.satellites.sentinel2?.indices?.evi
  if (evi === undefined) return null

  return {
    value: Math.round(evi * 1000) / 1000,
    confidence: 0.85,
    sources: [{ satellite: "Sentinel-2", weight: SATELLITE_WEIGHTS.sentinel2, value: evi }],
    agreement: "High",
    variance: 0,
  }
}

export function fuseData(data: AllSatelliteData): DataFusionResult {
  const fusedNDVI = fuseNDVI(data)
  const fusedTemp = fuseTemperature(data)
  const fusedMoisture = fuseMoisture(data)
  const fusedEVI = fuseEVI(data)

  const confidences: number[] = []
  const fused_metrics: DataFusionResult["fused_metrics"] = {}

  if (fusedNDVI) {
    fused_metrics.ndvi = fusedNDVI
    confidences.push(fusedNDVI.confidence)
  }
  if (fusedTemp) {
    fused_metrics.temperature = fusedTemp
    confidences.push(fusedTemp.confidence)
  }
  if (fusedMoisture) {
    fused_metrics.soil_moisture = fusedMoisture
    confidences.push(fusedMoisture.confidence)
  }
  if (fusedEVI) {
    fused_metrics.evi = fusedEVI
    confidences.push(fusedEVI.confidence)
  }

  const overallConf = confidences.length > 0 ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 0

  const agreements = [fusedNDVI?.agreement, fusedTemp?.agreement, fusedMoisture?.agreement, fusedEVI?.agreement].filter(Boolean)
  const highCount = agreements.filter((a) => a === "High").length
  const consensus: "High" | "Medium" | "Low" =
    highCount >= agreements.length * 0.7 ? "High" : highCount >= agreements.length * 0.5 ? "Medium" : "Low"

  const numSources = data.summary.active_satellites
  const quality =
    overallConf >= 0.8 && numSources >= 3
      ? "Excellent"
      : overallConf >= 0.6 && numSources >= 2
        ? "Good"
        : overallConf >= 0.4
          ? "Fair"
          : "Limited"

  return {
    fused_metrics,
    overall_confidence: Math.round(overallConf * 100) / 100,
    consensus_level: consensus,
    overall_quality: quality,
    data_sources: Object.keys(data.satellites).map((k) => k.replace("sentinel2", "Sentinel-2").replace("landsat8", "Landsat-8").replace("sentinel1", "Sentinel-1").replace("modis", "MODIS")),
    timestamp: new Date().toISOString(),
  }
}
