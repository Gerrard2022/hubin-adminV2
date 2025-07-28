// app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

      // Get current month rides
      const currentRidesQuery = `
        SELECT "FarePrice"
        FROM public."Rides"
        WHERE "CreatedAt" >= $1
      `;
      const currentRidesResult = await client.query(currentRidesQuery, [firstDayOfMonth.toISOString()]);

      // Get last month rides
      const lastMonthRidesQuery = `
        SELECT "FarePrice"
        FROM public."Rides"
        WHERE "CreatedAt" >= $1 AND "CreatedAt" < $2
      `;
      const lastMonthRidesResult = await client.query(lastMonthRidesQuery, [
        firstDayOfLastMonth.toISOString(),
        firstDayOfMonth.toISOString()
      ]);

      // Get current total drivers
      const currentDriversQuery = `
        SELECT COUNT(*) as count
        FROM public."Driver"
      `;
      const currentDriversResult = await client.query(currentDriversQuery);

      // Get drivers count before this month
      const lastMonthDriversQuery = `
        SELECT COUNT(*) as count
        FROM public."Driver"
        WHERE "CreatedAt" < $1
      `;
      const lastMonthDriversResult = await client.query(lastMonthDriversQuery, [firstDayOfMonth.toISOString()]);

      // Calculate totals and growth
      const currentRides = currentRidesResult.rows;
      const lastMonthRides = lastMonthRidesResult.rows;
      const currentDriversCount = parseInt(currentDriversResult.rows[0].count);
      const lastMonthDriversCount = parseInt(lastMonthDriversResult.rows[0].count);

      const rideGrowth = lastMonthRides.length 
        ? ((currentRides.length - lastMonthRides.length) / lastMonthRides.length) * 100 
        : 0;

      const driverGrowth = lastMonthDriversCount 
        ? ((currentDriversCount - lastMonthDriversCount) / lastMonthDriversCount) * 100 
        : 0;

      const currentRevenue = currentRides.reduce((sum, ride) => sum + (parseFloat(ride.FarePrice) || 0), 0);
      const lastMonthRevenue = lastMonthRides.reduce((sum, ride) => sum + (parseFloat(ride.FarePrice) || 0), 0);
      const revenueGrowth = lastMonthRevenue 
        ? ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      const stats = {
        totalRides: currentRides.length,
        totalDrivers: currentDriversCount,
        totalRevenue: currentRevenue,
        rideGrowth: Math.round(rideGrowth * 100) / 100,
        driverGrowth: Math.round(driverGrowth * 100) / 100,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      };

      return NextResponse.json(stats);
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}