import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    
    try {
      const query = `
        SELECT 
          di.*,
          d."LegalName" as driver_name,
          d."PhoneNumber" as driver_phone,
          d."Email" as driver_email
        FROM public."DriverInsurance" di
        LEFT JOIN public."Driver" d ON di."DriverId" = d."ClerkId"
        ORDER BY di."CreatedAt" DESC
      `;
      
      const result = await client.query(query);
      
      const insurances = result.rows.map(row => ({
        Id: row.Id,
        CreatedAt: row.CreatedAt,
        DriverId: row.DriverId,
        UpdatedOn: row.UpdatedOn,
        InsuranceDocument: row.InsuranceDocument,
        PolicyNo: row.PolicyNo,
        InceptionDate: row.InceptionDate,
        ExpiryDate: row.ExpiryDate,
        MarkType: row.MarkType,
        Chassis: row.Chassis,
        PSV: row.PSV,
        Usage: row.Usage,
        Insurer: row.Insurer,
        DriverName: row.driver_name
      }));
      
      return NextResponse.json(insurances);
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch driver insurances' }, 
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
        DriverId,
        InsuranceDocument,
        PolicyNo,
        InceptionDate,
        ExpiryDate,
        MarkType,
        Chassis,
        PSV,
        Usage,
        Insurer
      } = body;

      if (!DriverId) {
        return NextResponse.json(
          { error: 'DriverId is required' }, 
          { status: 400 }
        );
      }

      const query = `
        INSERT INTO public."DriverInsurance" (
          "DriverId", "InsuranceDocument", "PolicyNo", "InceptionDate", 
          "ExpiryDate", "MarkType", "Chassis", "PSV", "Usage", "Insurer"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const values = [
        DriverId, InsuranceDocument, PolicyNo, InceptionDate,
        ExpiryDate, MarkType, Chassis, PSV, Usage, Insurer
      ];

      const result = await client.query(query, values);
      return NextResponse.json(result.rows[0]);
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create driver insurance' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const client = await pool.connect();
    
    try {
      const {
        Id,
        DriverId,
        InsuranceDocument,
        PolicyNo,
        InceptionDate,
        ExpiryDate,
        MarkType,
        Chassis,
        PSV,
        Usage,
        Insurer
      } = body;

      if (!Id) {
        return NextResponse.json(
          { error: 'Insurance ID is required' }, 
          { status: 400 }
        );
      }

      const query = `
        UPDATE public."DriverInsurance" 
        SET 
          "DriverId" = $2,
          "InsuranceDocument" = $3,
          "PolicyNo" = $4,
          "InceptionDate" = $5,
          "ExpiryDate" = $6,
          "MarkType" = $7,
          "Chassis" = $8,
          "PSV" = $9,
          "Usage" = $10,
          "Insurer" = $11,
          "UpdatedOn" = NOW()
        WHERE "Id" = $1
        RETURNING *
      `;

      const values = [
        Id, DriverId, InsuranceDocument, PolicyNo, InceptionDate,
        ExpiryDate, MarkType, Chassis, PSV, Usage, Insurer
      ];

      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Insurance record not found' }, 
          { status: 404 }
        );
      }

      return NextResponse.json(result.rows[0]);
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update driver insurance' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Insurance ID is required' }, 
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const query = `
        DELETE FROM public."DriverInsurance" 
        WHERE "Id" = $1
        RETURNING *
      `;

      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Insurance record not found' }, 
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Insurance record deleted successfully'
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete driver insurance' }, 
      { status: 500 }
    );
  }
}