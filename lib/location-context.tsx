"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Location, AllSatelliteData } from "./types"

interface LocationContextType {
  location: Location | null
  setLocation: (loc: Location) => void
  satelliteData: AllSatelliteData | null
  setSatelliteData: (data: AllSatelliteData | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
  fetchSatelliteData: (lat: number, lon: number) => Promise<void>
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<Location | null>(null)
  const [satelliteData, setSatelliteData] = useState<AllSatelliteData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setLocation = useCallback((loc: Location) => {
    setLocationState(loc)
  }, [])

  const fetchSatelliteData = useCallback(async (lat: number, lon: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/satellite-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      })
      if (!res.ok) throw new Error("Failed to fetch satellite data")
      const json = await res.json()
      setSatelliteData(json.data)
      setLocationState({ lat, lon })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        satelliteData,
        setSatelliteData,
        isLoading,
        setIsLoading,
        error,
        setError,
        fetchSatelliteData,
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error("useLocation must be used within LocationProvider")
  return ctx
}
