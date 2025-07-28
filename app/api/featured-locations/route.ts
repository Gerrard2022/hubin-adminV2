import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      const query = `
        SELECT "Id", "CreatedAt", "Title", "SubTitle", "Image", "AddressId"
        FROM public."FeaturedLocations"
        ORDER BY "CreatedAt" DESC
      `;
      
      const result = await client.query(query);
      
      return NextResponse.json(result.rows);
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured locations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { Title, SubTitle, Image, AddressId } = await request.json();
    
    if (!Title || !SubTitle || !Image) {
      return NextResponse.json(
        { error: 'Title, SubTitle, and Image are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const query = `
        INSERT INTO public."FeaturedLocations" ("Title", "SubTitle", "Image", "AddressId")
        VALUES ($1, $2, $3, $4)
        RETURNING "Id", "CreatedAt", "Title", "SubTitle", "Image", "AddressId"
      `;
      
      const result = await client.query(query, [Title, SubTitle, Image, AddressId || null]);
      
      return NextResponse.json(result.rows[0]);
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create featured location' },
      { status: 500 }
    );
  }
}