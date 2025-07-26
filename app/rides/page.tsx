'use client';

import { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from "@/lib/supabase";

interface Ride {
  ride_id: string;
  DestinationAddress: string;
  OriginAddress: string;
  CreatedAt: string;
  FarePrice: number;
  is_completed: boolean;
  PaymentStatus: string;
  DriverId: string;
  Driver?: {
    LegalName: string;
    PhoneNumber: string;
  };
}

export default function Rides() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const { data: fetchedRides, error } = await supabase
        .from('Rides')
        .select(`
          *,
          Driver:DriverId (
            LegalName,
            PhoneNumber
          )
        `)
        .order('CreatedAt', { ascending: false });

      if (error) throw error;
      if (fetchedRides) setRides(fetchedRides);
    } catch (error) {
      console.error('Error fetching rides:', error);
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
    }).format(amount);
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h4 className="text-lg font-semibold m-0">Rides List</h4>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Driver</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead className="min-w-[180px]">From</TableHead>
                  <TableHead className="min-w-[180px]">To</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="min-w-[120px]">Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rides.map((ride) => (
                  <TableRow key={ride.ride_id}>
                    <TableCell className="min-w-[180px]">{ride.Driver?.LegalName || 'N/A'}</TableCell>
                    <TableCell>{ride.Driver?.PhoneNumber || 'N/A'}</TableCell>
                    <TableCell className="min-w-[180px] truncate">{ride.OriginAddress}</TableCell>
                    <TableCell className="min-w-[180px] truncate">{ride.DestinationAddress}</TableCell>
                    <TableCell>{new Date(ride.CreatedAt).toLocaleDateString()}</TableCell>
                    <TableCell>{formatCurrency(ride.FarePrice)}</TableCell>
                    <TableCell>
                      <Badge variant={ride.is_completed ? 'default' : 'secondary'} className={ride.is_completed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {ride.is_completed ? 'Completed' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <Badge variant={ride.PaymentStatus === 'paid' ? 'default' : 'secondary'} className={ride.PaymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                        {ride.PaymentStatus === 'paid' ? 'Paid' : 'Not Paid'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {loading && <div className="p-4 text-center text-gray-500">Loading...</div>}
            {!loading && rides.length === 0 && <div className="p-4 text-center text-gray-500">No rides found.</div>}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
