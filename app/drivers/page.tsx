'use client';

import { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';

interface Driver {
  id: string;
  LegalName: string;
  PhoneNumber: string;
  Email: string;
  Approved: boolean;
  CreatedAt: string;
  Vehicle: string;
  Plate: string;
  total_rides?: number;
  NationalId?: string;
  DrivingPermit?: string;
}

const getImageUrl = (imagePath: string | null | undefined) => {
  if (!imagePath) return null;
  const { data } = supabase.storage.from('drivers-documents').getPublicUrl(imagePath);
  return data.publicUrl;
};

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const { data: driversData, error: driversError } = await supabase
        .from('Driver')
        .select('*')
        .order('CreatedAt', { ascending: false });
      if (driversError) throw driversError;
      if (driversData) {
        const driversWithCounts = await Promise.all(
          driversData.map(async (driver) => {
            const { count } = await supabase
              .from('Rides')
              .select('*', { count: 'exact' })
              .eq('DriverId', driver.id);
            return {
              ...driver,
              total_rides: count || 0
            };
          })
        );
        setDrivers(driversWithCounts);
      }
    } catch (error) {
      alert('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalChange = async (driverId: string, newStatus: boolean) => {
    try {
      setDrivers(currentDrivers =>
        currentDrivers.map(driver =>
          driver.id === driverId
            ? { ...driver, Approved: newStatus }
            : driver
        )
      );
      const { error } = await supabase
        .from('Driver')
        .update({ Approved: newStatus })
        .eq('id', driverId);
      if (error) {
        setDrivers(currentDrivers =>
          currentDrivers.map(driver =>
            driver.id === driverId
              ? { ...driver, Approved: !newStatus }
              : driver
          )
        );
        throw error;
      }
      alert(`Driver ${newStatus ? 'approved' : 'unapproved'} successfully`);
    } catch (error) {
      alert('Failed to update driver status');
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h4 className="text-lg font-semibold m-0">Drivers List</h4>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Car Type</TableHead>
                  <TableHead>Car Number</TableHead>
                  <TableHead>Total Rides</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="max-w-[180px] truncate font-semibold">{driver.LegalName}</TableCell>
                    <TableCell>{driver.PhoneNumber}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{driver.Email}</TableCell>
                    <TableCell><Badge variant="secondary">{driver.Vehicle}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{driver.Plate}</Badge></TableCell>
                    <TableCell><Badge variant="default">{driver.total_rides}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={driver.Approved ? 'default' : 'secondary'} className={driver.Approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {driver.Approved ? 'Approved' : 'Not Approved'}
                      </Badge>
                    </TableCell>
                    <TableCell key={driver.id + '-action'}>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button key={driver.id + '-trigger'} variant="link" size="sm">
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent key={driver.id + '-dialog'} className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Driver Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div key={driver.id + '-name'}>
                                <div className="text-xs text-gray-500">Name</div>
                                <div className="font-medium">{driver.LegalName}</div>
                              </div>
                              <div key={driver.id + '-phone'}>
                                <div className="text-xs text-gray-500">Phone</div>
                                <div className="font-medium">{driver.PhoneNumber}</div>
                              </div>
                              <div key={driver.id + '-email'}>
                                <div className="text-xs text-gray-500">Email</div>
                                <div className="font-medium">{driver.Email}</div>
                              </div>
                              <div key={driver.id + '-vehicle'}>
                                <div className="text-xs text-gray-500">Car Type</div>
                                <Badge variant="secondary">{driver.Vehicle}</Badge>
                              </div>
                              <div key={driver.id + '-plate'}>
                                <div className="text-xs text-gray-500">Car Number</div>
                                <Badge variant="outline">{driver.Plate}</Badge>
                              </div>
                              <div key={driver.id + '-rides'}>
                                <div className="text-xs text-gray-500">Total Rides</div>
                                <Badge variant="default">{driver.total_rides}</Badge>
                              </div>
                              <div className="col-span-2" key={driver.id + '-nid'}>
                                <div className="text-xs text-gray-500 mb-2">National ID</div>
                                <div className="border rounded-lg p-4 bg-gray-50">
                                  {driver.NationalId ? (
                                    <img
                                      src={driver.NationalId}
                                      alt="National ID"
                                      className="rounded-lg max-h-[200px] object-contain"
                                    />
                                  ) : (
                                    <div className="text-gray-500 italic">Not provided</div>
                                  )}
                                </div>
                              </div>
                              <div className="col-span-2" key={driver.id + '-permit'}>
                                <div className="text-xs text-gray-500 mb-2">Driving Permit</div>
                                <div className="border rounded-lg p-4 bg-gray-50">
                                  {driver.DrivingPermit ? (
                                    <img
                                      src={driver.DrivingPermit}
                                      alt="Driving Permit"
                                      className="rounded-lg max-h-[200px] object-contain"
                                    />
                                  ) : (
                                    <div className="text-gray-500 italic">Not provided</div>
                                  )}
                                </div>
                              </div>
                              <div key={driver.id + '-status'}>
                                <div className="text-xs text-gray-500">Status</div>
                                <Switch
                                  checked={driver.Approved}
                                  onCheckedChange={(checked) => handleApprovalChange(driver.id, checked)}
                                />
                              </div>
                              <div key={driver.id + '-joined'}>
                                <div className="text-xs text-gray-500">Joined Date</div>
                                <div className="font-medium">
                                  {new Date(driver.CreatedAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Close</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {loading && <div className="p-4 text-center text-gray-500">Loading...</div>}
            {!loading && drivers.length === 0 && <div className="p-4 text-center text-gray-500">No drivers found.</div>}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
