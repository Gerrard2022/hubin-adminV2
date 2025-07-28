import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    
    try {
      // Query to get rides with joined driver and location data
      const query = `
        SELECT 
          r."RideId",
          r."LocationId",
          r."RideTime",
          r."FarePrice",
          r."PaymentStatus",
          r."PaymentMethod",
          r."DriverId",
          r."UserId",
          r."IsCompleted",
          r."DriverClerkId",
          r."Organization",
          r."Distance",
          r."IsDriverPaid",
          r."Type",
          r."Passengers",
          r."DepartureDate",
          r."DepartureTime",
          r."PaymentInitiatedAt",
          r."TipAmount",
          r."IsSent",
          r."CreatedAt",
          -- Driver information
          d."LegalName" as driver_legal_name,
          d."PhoneNumber" as driver_phone_number,
          -- Location information
          l."OriginAddress" as origin_address,
          l."DestinationAddress" as destination_address
        FROM public."Rides" r
        LEFT JOIN public."Driver" d ON r."DriverId" = d."Id"
        LEFT JOIN public."Location" l ON r."LocationId" = l."Id"
        ORDER BY r."CreatedAt" DESC
      `;
      
      const result = await client.query(query);
      
      // Transform the data to match the expected structure
      const rides = result.rows.map(row => ({
        RideId: row.RideId,
        LocationId: row.LocationId,
        RideTime: row.RideTime,
        FarePrice: parseFloat(row.FarePrice) || 0,
        PaymentStatus: row.PaymentStatus,
        PaymentMethod: row.PaymentMethod,
        DriverId: row.DriverId,
        UserId: row.UserId,
        IsCompleted: row.IsCompleted,
        DriverClerkId: row.DriverClerkId,
        Organization: row.Organization,
        Distance: parseFloat(row.Distance) || 0,
        IsDriverPaid: row.IsDriverPaid,
        Type: row.Type,
        Passengers: row.Passengers,
        DepartureDate: row.DepartureDate,
        DepartureTime: row.DepartureTime,
        PaymentInitiatedAt: row.PaymentInitiatedAt,
        TipAmount: parseFloat(row.TipAmount) || 0,
        IsSent: row.IsSent,
        CreatedAt: row.CreatedAt,
        Driver: row.driver_legal_name ? {
          LegalName: row.driver_legal_name,
          PhoneNumber: row.driver_phone_number
        } : null,
        Location: row.origin_address ? {
          OriginAddress: row.origin_address,
          DestinationAddress: row.destination_address
        } : null
      }));
      
      return NextResponse.json(rides);
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rides' }, 
      { status: 500 }
    );
  }
}

// Optional: Add other HTTP methods if needed
export async function POST(request: NextRequest) {
  // Handle ride creation if needed
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
}

export async function PUT(request: NextRequest) {
  // Handle ride updates if needed
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
}

export async function DELETE(request: NextRequest) {
  // Handle ride deletion if needed
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
}