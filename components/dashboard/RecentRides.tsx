'use client';

import { Card } from '@/components/ui/card';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface RecentRide {
  RideId: string;
  FarePrice: number;
  CreatedAt: string;
  PaymentStatus: string;
}

export default function RecentRides() {
  const [rides, setRides] = useState<RecentRide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentRides();
  }, []);

  const fetchRecentRides = async () => {
    try {
      const { data, error } = await supabase
        .from('Rides')
        .select('RideId, FarePrice, CreatedAt, PaymentStatus')
        .order('CreatedAt', { ascending: false })
        .limit(5);

      if (error) throw error;
      if (data) setRides(data);
    } catch (error) {
      console.error('Error fetching recent rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      currencyDisplay: 'code'
    }).format(amount)
    .replace('RWF', 'RWF')
    .trim();
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-6 pt-6 pb-2">
        <h5 className="text-lg font-semibold mb-1">Recent Rides</h5>
        <p className="text-sm text-muted-foreground mb-2">Last 5 rides with payment status</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-muted-foreground py-6">Loading...</TableCell>
            </TableRow>
          ) : rides.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-muted-foreground py-6">No recent rides found.</TableCell>
            </TableRow>
          ) : (
            rides.map((ride) => (
              <TableRow key={ride.RideId} className="hover:bg-accent/40 transition-colors">
                <TableCell className="font-medium">{formatCurrency(ride.FarePrice)}</TableCell>
                <TableCell>
                  <Badge variant={ride.PaymentStatus === 'paid' ? 'default' : 'secondary'}
                    className={ride.PaymentStatus === 'paid' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}>
                    {ride.PaymentStatus === 'paid' ? 'Paid' : 'Not Paid'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
} 