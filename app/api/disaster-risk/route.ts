import { NextResponse } from "next/server"
import { getDisasterRiskAnalysis } from "@/lib/satellite-data"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { lat, lon, riskType } = body

    if (lat === undefined || lon === undefined) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    const result = getDisasterRiskAnalysis(lat, lon, riskType)

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error("Disaster risk error:", error)
    return NextResponse.json({ error: "Failed to assess disaster risk" }, { status: 500 })
  }
}
