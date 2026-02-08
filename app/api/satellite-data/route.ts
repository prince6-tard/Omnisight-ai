import { NextResponse } from "next/server"
import { getAllSatelliteData } from "@/lib/satellite-data"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { lat, lon } = body

    if (lat === undefined || lon === undefined) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 })
    }

    const data = getAllSatelliteData(lat, lon)

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Satellite data error:", error)
    return NextResponse.json({ error: "Failed to fetch satellite data" }, { status: 500 })
  }
}
