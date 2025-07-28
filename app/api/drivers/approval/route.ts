
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { driverId, approved } = body;

    if (!driverId || typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Driver ID and approved status are required' }, 
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const query = `
        UPDATE public."Driver" 
        SET "Approved" = $1
        WHERE "Id" = $2
        RETURNING *
      `;

      const result = await client.query(query, [approved, driverId]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Driver not found' }, 
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        driver: result.rows[0]
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update driver approval status' }, 
      { status: 500 }
    );
  }
}

// Optional: GET method to fetch a specific driver's approval status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');

    if (!driverId) {
      return NextResponse.json(
        { error: 'Driver ID is required' }, 
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const query = `
        SELECT "Id", "LegalName", "Approved" 
        FROM public."Driver" 
        WHERE "Id" = $1
      `;

      const result = await client.query(query, [driverId]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Driver not found' }, 
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
      { error: 'Failed to fetch driver' }, 
      { status: 500 }
    );
  }
}