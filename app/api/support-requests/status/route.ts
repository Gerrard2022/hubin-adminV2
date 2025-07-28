import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, status } = body;

    // Validate input
    if (!requestId || !status) {
      return NextResponse.json(
        { error: 'Request ID and status are required' }, 
        { status: 400 }
      );
    }

    // Validate status values
    const validStatuses = ['pending', 'answered', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: pending, answered, resolved, closed' }, 
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const query = `
        UPDATE public."SupportRequests" 
        SET "Status" = $1
        WHERE "Id" = $2
        RETURNING *
      `;

      const result = await client.query(query, [status, requestId]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Support request not found' }, 
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        supportRequest: result.rows[0]
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update support request status' }, 
      { status: 500 }
    );
  }
}

// Optional: GET method to fetch a specific support request
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' }, 
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const query = `
        SELECT 
          sr.*,
          u."ClerkId" as user_clerk_id
        FROM public."SupportRequests" sr
        LEFT JOIN public."User" u ON sr."UserId" = u."ClerkId"
        WHERE sr."Id" = $1
      `;

      const result = await client.query(query, [requestId]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Support request not found' }, 
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
      { error: 'Failed to fetch support request' }, 
      { status: 500 }
    );
  }
}