import { NextResponse } from "next/server"
import { getCropHealthAnalysis } from "@/lib/satellite-data"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { lat, lon, cropType, farmArea } = body

    if (lat === undefined || lon === undefined) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    const result = getCropHealthAnalysis(lat, lon, cropType, farmArea)

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error("Crop health error:", error)
    return NextResponse.json({ error: "Failed to analyze crop health" }, { status: 500 })
  }
}
