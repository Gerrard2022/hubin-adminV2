import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    
    try {
      const query = `
        SELECT 
          d.*,
          COUNT(r."RideId") as total_rides
        FROM public."Driver" d
        LEFT JOIN public."Rides" r ON d."Id" = r."DriverId"
        GROUP BY d."Id"
        ORDER BY d."CreatedAt" DESC
      `;
      
      const result = await client.query(query);
      
      const drivers = result.rows.map(row => ({
        Id: row.Id,
        CreatedAt: row.CreatedAt,
        LegalName: row.LegalName,
        Email: row.Email,
        PhoneNumber: row.PhoneNumber,
        Password: row.Password,
        NationalId: row.NationalId,
        DrivingPermit: row.DrivingPermit,
        Vehicle: row.Vehicle,
        Seats: row.Seats,
        ClerkId: row.ClerkId,
        Role: row.Role,
        Price: row.Price,
        ProfilePicture: row.ProfilePicture,
        IsActive: row.IsActive,
        Plate: row.Plate,
        Approved: row.Approved,
        MomoCode: row.MomoCode,
        VehicleImage: row.VehicleImage,
        InsuranceDocument: row.InsuranceDocument,
        AddressId: row.AddressId,
        total_rides: parseInt(row.total_rides) || 0
      }));
      
      return NextResponse.json(drivers);
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drivers' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = await pool.connect();
    
    try {
      const {
        LegalName,
        Email,
        PhoneNumber,
        Password,
        NationalId,
        DrivingPermit,
        Vehicle,
        Seats,
        ClerkId,
        Role,
        Price,
        ProfilePicture,
        IsActive,
        Plate,
        Approved,
        MomoCode,
        VehicleImage,
        InsuranceDocument,
        AddressId
      } = body;

      const query = `
        INSERT INTO public."Driver" (
          "LegalName", "Email", "PhoneNumber", "Password", "NationalId",
          "DrivingPermit", "Vehicle", "Seats", "ClerkId", "Role", "Price",
          "ProfilePicture", "IsActive", "Plate", "Approved", "MomoCode",
          "VehicleImage", "InsuranceDocument", "AddressId"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING *
      `;

      const values = [
        LegalName, Email, PhoneNumber, Password, NationalId,
        DrivingPermit, Vehicle, Seats, ClerkId, Role, Price,
        ProfilePicture, IsActive, Plate, Approved, MomoCode,
        VehicleImage, InsuranceDocument, AddressId
      ];

      const result = await client.query(query, values);
      return NextResponse.json(result.rows[0]);
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create driver' }, 
      { status: 500 }
    );
  }
}