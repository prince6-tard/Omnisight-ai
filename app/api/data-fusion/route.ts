import { NextResponse } from "next/server"
import { getAllSatelliteData } from "@/lib/satellite-data"
import { fuseData } from "@/lib/data-fusion"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { lat, lon } = body

    if (lat === undefined || lon === undefined) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    const satelliteData = getAllSatelliteData(lat, lon)
    const fusionResult = fuseData(satelliteData)

    return NextResponse.json({ data: fusionResult })
  } catch (error) {
    console.error("Data fusion error:", error)
    return NextResponse.json({ error: "Failed to fuse data" }, { status: 500 })
  }
}
