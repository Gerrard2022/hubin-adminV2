// app/api/featured-locations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { Title, SubTitle, Image, AddressId } = await request.json();
    const { id } = params;
    
    if (!Title || !SubTitle || !Image) {
      return NextResponse.json(
        { error: 'Title, SubTitle, and Image are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const query = `
        UPDATE public."FeaturedLocations"
        SET "Title" = $1, "SubTitle" = $2, "Image" = $3, "AddressId" = $4
        WHERE "Id" = $5
        RETURNING "Id", "CreatedAt", "Title", "SubTitle", "Image", "AddressId"
      `;
      
      const result = await client.query(query, [Title, SubTitle, Image, AddressId || null, id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Featured location not found' },
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
      { error: 'Failed to update featured location' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const client = await pool.connect();
    
    try {
      const query = `
        DELETE FROM public."FeaturedLocations"
        WHERE "Id" = $1
        RETURNING "Id"
      `;
      
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Featured location not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ 
        success: true,
        deletedId: result.rows[0].Id 
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete featured location' },
      { status: 500 }
    );
  }
}

// Optional: GET method to fetch a specific featured location
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const client = await pool.connect();
    
    try {
      const query = `
        SELECT "Id", "CreatedAt", "Title", "SubTitle", "Image", "AddressId"
        FROM public."FeaturedLocations"
        WHERE "Id" = $1
      `;
      
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Featured location not found' },
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
      { error: 'Failed to fetch featured location' },
      { status: 500 }
    );
  }
}