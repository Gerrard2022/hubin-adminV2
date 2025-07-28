
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    
    try {
      // Query to get support requests, filtering for pending by default
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status') || 'pending';
      
      const query = `
        SELECT 
          sr.*
        FROM public."SupportRequests" sr
        WHERE sr."Status" = $1
        ORDER BY sr."CreatedAt" DESC
      `;
      
      const result = await client.query(query, [status]);
      
      // Transform the data to match the expected structure
      const supportRequests = result.rows.map(row => ({
        Id: row.Id,
        CreatedAt: row.CreatedAt,
        Message: row.Message,
        ContactInfo: row.ContactInfo,
        Status: row.Status,
        Subject: row.Subject,
        UserId: row.UserId
      }));
      
      return NextResponse.json(supportRequests);
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch support requests' }, 
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
        Message,
        ContactInfo,
        Status = 'pending',
        Subject,
        UserId
      } = body;

      // Validate required fields
      if (!Message || !ContactInfo || !Subject || !UserId) {
        return NextResponse.json(
          { error: 'Message, ContactInfo, Subject, and UserId are required' }, 
          { status: 400 }
        );
      }

      const query = `
        INSERT INTO public."SupportRequests" (
          "Message", "ContactInfo", "Status", "Subject", "UserId"
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const values = [Message, ContactInfo, Status, Subject, UserId];

      const result = await client.query(query, values);
      return NextResponse.json(result.rows[0]);
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create support request' }, 
      { status: 500 }
    );
  }
}

export async function getAllSupportRequests() {
  try {
    const client = await pool.connect();
    
    try {
      const query = `
        SELECT 
          sr.*,
          u."ClerkId" as user_clerk_id
        FROM public."SupportRequests" sr
        LEFT JOIN public."User" u ON sr."UserId" = u."ClerkId"
        ORDER BY sr."CreatedAt" DESC
      `;
      
      const result = await client.query(query);
      return result.rows;
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}