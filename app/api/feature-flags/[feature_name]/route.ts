import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();

    try {
      const query = `
        SELECT "id", "feature_name", "is_enabled"
        FROM public."FeatureFlags"
        ORDER BY "feature_name"
      `;

      const result = await client.query(query);
      return NextResponse.json(result.rows);

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Database error (GET):', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature flags' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { feature_name, is_enabled } = await request.json();

    if (!feature_name) {
      return NextResponse.json(
        { error: 'feature_name is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      const query = `
        INSERT INTO public."FeatureFlags" ("feature_name", "is_enabled")
        VALUES ($1, $2)
        ON CONFLICT ("feature_name") DO UPDATE SET "is_enabled" = EXCLUDED."is_enabled"
        RETURNING "id", "feature_name", "is_enabled"
      `;

      const result = await client.query(query, [feature_name, is_enabled ?? false]);
      return NextResponse.json(result.rows[0]);

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Database error (POST):', error);

    return NextResponse.json(
      { error: 'Failed to create or update feature flag' },
      { status: 500 }
    );
  }
}
