'use client';

import { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverFilter, setDriverFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

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
      if (fetchedRides) {
        setRides(fetchedRides);
        setFilteredRides(fetchedRides);
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = rides;

    if (driverFilter !== 'all') {
      filtered = filtered.filter(ride => ride.Driver?.LegalName === driverFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ride => 
        statusFilter === 'completed' ? ride.is_completed : !ride.is_completed
      );
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(ride => ride.PaymentStatus === paymentFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(ride => 
        ride.Driver?.LegalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.OriginAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.DestinationAddress?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRides(filtered);
  }, [rides, driverFilter, statusFilter, paymentFilter, searchTerm]);

  const uniqueDrivers = Array.from(new Set(rides.map(ride => ride.Driver?.LegalName).filter(Boolean)));


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
      <div className="p-4">
        <div className="bg-white rounded-lg shadow border">
          <div className="p-4 border-b">
            <h4 className="text-lg font-semibold mb-4">Rides List</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Input
                placeholder="Search rides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              
              <Select value={driverFilter} onValueChange={setDriverFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by driver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Drivers</SelectItem>
                  {uniqueDrivers.map((driver) => (
                  <SelectItem key={driver} value={driver || 'N/A'}>{driver}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Not Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Driver</TableHead>
                  <TableHead className="w-28">Phone</TableHead>
                  <TableHead className="w-40">From</TableHead>
                  <TableHead className="w-40">To</TableHead>
                  <TableHead className="w-24">Date</TableHead>
                  <TableHead className="w-24">Amount</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-24">Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">Loading...</TableCell>
                  </TableRow>
                ) : filteredRides.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">No rides found.</TableCell>
                  </TableRow>
                ) : (
                  filteredRides.map((ride) => (
                    <TableRow key={ride.ride_id}>
                      <TableCell className="w-32 truncate" title={ride.Driver?.LegalName || 'N/A'}>
                        {ride.Driver?.LegalName || 'N/A'}
                      </TableCell>
                      <TableCell className="w-28 truncate" title={ride.Driver?.PhoneNumber || 'N/A'}>
                        {ride.Driver?.PhoneNumber || 'N/A'}
                      </TableCell>
                      <TableCell className="w-40 truncate" title={ride.OriginAddress}>
                        {ride.OriginAddress}
                      </TableCell>
                      <TableCell className="w-40 truncate" title={ride.DestinationAddress}>
                        {ride.DestinationAddress}
                      </TableCell>
                      <TableCell className="w-24">
                        {new Date(ride.CreatedAt).toLocaleDateString('en-GB')}
                      </TableCell>
                      <TableCell className="w-24">
                        {formatCurrency(ride.FarePrice)}
                      </TableCell>
                      <TableCell className="w-24">
                        <Badge 
                          variant={ride.is_completed ? 'default' : 'secondary'} 
                          className={`text-xs ${ride.is_completed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {ride.is_completed ? 'Done' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-24">
                        <Badge 
                          variant={ride.PaymentStatus === 'paid' ? 'default' : 'secondary'} 
                          className={`text-xs ${ride.PaymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}
                        >
                          {ride.PaymentStatus === 'paid' ? 'Paid' : 'Not Paid'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="p-4 border-t text-sm text-gray-600">
            Showing {filteredRides.length} of {rides.length} rides
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
