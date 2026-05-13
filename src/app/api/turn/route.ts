import { NextResponse } from 'next/server'

export async function GET() {
  const domain = process.env.METERED_DOMAIN
  const apiKey = process.env.METERED_API_KEY

  if (!domain || !apiKey) {
    // Fallback to basic STUN if environment variables aren't configured yet
    return NextResponse.json([
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ])
  }

  try {
    // Handle case where user puts the full domain in the .env variable
    const cleanDomain = domain.replace('.metered.live', '')
    const response = await fetch(`https://${cleanDomain}.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`, {
      // Ensure we always fetch fresh credentials, as TURN credentials can expire
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`Metered API returned status ${response.status}`)
    }

    const iceServers = await response.json()
    return NextResponse.json(iceServers)
  } catch (error) {
    console.error('Error fetching TURN credentials from Metered:', error)
    // Fallback to STUN on error so the call can still attempt to connect
    return NextResponse.json([
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ], { status: 500 })
  }
}
