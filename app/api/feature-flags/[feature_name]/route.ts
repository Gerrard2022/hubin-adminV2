import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const featureName = pathSegments[pathSegments.length - 1];
    
    console.log('PUT request URL:', request.url);
    console.log('Feature name from URL:', featureName);
    
    if (!featureName || featureName === 'feature-flags') {
      return NextResponse.json(
        { error: 'Feature name or ID is required in URL path' },
        { status: 400 }
      );
    }

    const decodedFeatureName = decodeURIComponent(featureName);
    const client = await pool.connect();
    
    try {
      // First, get the current state of the feature flag
      // Check if it's an ID (numeric) or feature name (string)
      const isNumericId = /^\d+$/.test(decodedFeatureName);
      
      let getCurrentQuery: string;
      let getCurrentParams: any[];
      
      if (isNumericId) {
        getCurrentQuery = `
          SELECT "id", "feature_name", "is_enabled"
          FROM public."FeatureFlags"
          WHERE "id" = $1
        `;
        getCurrentParams = [parseInt(decodedFeatureName)];
      } else {
        getCurrentQuery = `
          SELECT "id", "feature_name", "is_enabled"
          FROM public."FeatureFlags"
          WHERE "feature_name" = $1
        `;
        getCurrentParams = [decodedFeatureName];
      }
      
      const currentResult = await client.query(getCurrentQuery, getCurrentParams);
      
      if (currentResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Feature flag not found' },
          { status: 404 }
        );
      }
      
      const currentFlag = currentResult.rows[0];
      const newEnabledState = !currentFlag.is_enabled;
      
      // Update the feature flag with the toggled value
      let updateQuery: string;
      let updateParams: any[];
      
      if (isNumericId) {
        updateQuery = `
          UPDATE public."FeatureFlags"
          SET "is_enabled" = $1
          WHERE "id" = $2
          RETURNING "id", "feature_name", "is_enabled"
        `;
        updateParams = [newEnabledState, parseInt(decodedFeatureName)];
      } else {
        updateQuery = `
          UPDATE public."FeatureFlags"
          SET "is_enabled" = $1
          WHERE "feature_name" = $2
          RETURNING "id", "feature_name", "is_enabled"
        `;
        updateParams = [newEnabledState, decodedFeatureName];
      }
      
      const updateResult = await client.query(updateQuery, updateParams);
      
      return NextResponse.json(updateResult.rows[0]);
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error (PUT):', error);
    return NextResponse.json(
      { error: 'Failed to toggle feature flag' },
      { status: 500 }
    );
  }
}

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
