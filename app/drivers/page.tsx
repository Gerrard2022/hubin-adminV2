'use client';

import { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { ApprovalPopup } from '@/components/ApprovalPopup';
import { toast } from "sonner"

interface Driver {
  Id: string;
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
  const [pendingApproval, setPendingApproval] = useState<{
    driverId: string;
    newStatus: boolean;
    driverName: string;
  } | null>(null);
  const [isDisapproveOpen, setIsDisapproveOpen] = useState(false);

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
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };  

  const handleSwitchChange = (driver: Driver, newStatus: boolean) => {
    setPendingApproval({
      driverId: driver.Id,
      newStatus,
      driverName: driver.LegalName
    });
    setIsDisapproveOpen(true);
  };

  const handleApprovalConfirm = async () => {
    if (!pendingApproval) return;

    try {
      setDrivers(currentDrivers =>
        currentDrivers.map(driver =>
          driver.Id === pendingApproval.driverId
            ? { ...driver, Approved: pendingApproval.newStatus }
            : driver
        )
      );

      const { error } = await supabase
        .from('Driver')
        .update({ Approved: pendingApproval.newStatus })
        .eq('Id', pendingApproval.driverId);

      if (error) {
        setDrivers(currentDrivers =>
          currentDrivers.map(driver =>
            driver.Id === pendingApproval.driverId
              ? { ...driver, Approved: !pendingApproval.newStatus }
              : driver
          )
        );
        throw error;
      }

      toast.success(`Driver ${pendingApproval.newStatus ? 'approved' : 'unapproved'} successfully`);
    } catch (error) {
      toast.error('Failed to update driver status');
    } finally {
      setPendingApproval(null);
    }
  };

  const handleApprovalCancel = () => {
    setPendingApproval(null);
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
                  <TableRow key={driver.Id}>
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
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="link" size="sm">
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Driver Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-gray-500">Name</div>
                                <div className="font-medium">{driver.LegalName}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Phone</div>
                                <div className="font-medium">{driver.PhoneNumber}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Email</div>
                                <div className="font-medium">{driver.Email}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Car Type</div>
                                <Badge variant="secondary">{driver.Vehicle}</Badge>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Car Number</div>
                                <Badge variant="outline">{driver.Plate}</Badge>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Total Rides</div>
                                <Badge variant="default">{driver.total_rides}</Badge>
                              </div>
                              <div className="col-span-2">
                                <div className="text-xs text-gray-500 mb-2">National ID</div>
                                <div className="border rounded-lg p-4 bg-gray-50">
                                  {driver.NationalId ? (
                                    <img
                                      src={getImageUrl(driver.NationalId) || ''}
                                      alt="National ID"
                                      className="rounded-lg max-h-[200px] object-contain"
                                    />
                                  ) : (
                                    <div className="text-gray-500 italic">Not provided</div>
                                  )}
                                </div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-xs text-gray-500 mb-2">Driving Permit</div>
                                <div className="border rounded-lg p-4 bg-gray-50">
                                  {driver.DrivingPermit ? (
                                    <img
                                      src={getImageUrl(driver.DrivingPermit) || ''}
                                      alt="Driving Permit"
                                      className="rounded-lg max-h-[200px] object-contain"
                                    />
                                  ) : (
                                    <div className="text-gray-500 italic">Not provided</div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-2">Approval Status</div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={driver.Approved}
                                    onCheckedChange={(checked) => handleSwitchChange(driver, checked)}
                                  />
                                  <span className="text-sm">
                                    {driver.Approved ? 'Approved' : 'Not Approved'}
                                  </span>
                                </div>
                              </div>
                              <div>
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

      {pendingApproval && (
        <ApprovalPopup
          Title={`${pendingApproval.newStatus ? 'Approve' : 'Disapprove'} Driver`}
          Description={`Are you sure you want to ${pendingApproval.newStatus ? 'approve' : 'disapprove'} ${pendingApproval.driverName}?`}
          OnConfirm={handleApprovalConfirm}
          OnCancel={handleApprovalCancel}
          isOpen={isDisapproveOpen}
        />
      )}
    </MainLayout>
  );
}