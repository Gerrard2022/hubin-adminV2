'use client';

import { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import MainLayout from '@/components/layout/MainLayout';
import { ApprovalPopup } from '@/components/ApprovalPopup';
import { toast } from "sonner"

interface Driver {
  Id: string;
  CreatedAt: string;
  LegalName: string;
  Email: string;
  PhoneNumber: string;
  Password: string;
  NationalId?: string;
  DrivingPermit?: string;
  Vehicle?: string;
  Seats?: string;
  ClerkId: string;
  Role?: string;
  Price?: string;
  ProfilePicture?: string;
  IsActive?: boolean;
  Plate: string;
  Approved: boolean;
  MomoCode?: number;
  VehicleImage?: string;
  InsuranceDocument?: string;
  AddressId?: string;
  total_rides?: number;
}

const getImageUrl = (imagePath: string | null | undefined) => {
  if (!imagePath) return null;
  return imagePath;
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
      
      const response = await fetch('/api/drivers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch drivers');
      }

      const driversData = await response.json();
      setDrivers(driversData);
      
    } catch (error) {
      console.error('Error fetching drivers:', error);
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
      // Optimistically update the UI
      setDrivers(currentDrivers =>
        currentDrivers.map(driver =>
          driver.Id === pendingApproval.driverId
            ? { ...driver, Approved: pendingApproval.newStatus }
            : driver
        )
      );

      const response = await fetch('/api/drivers/approval', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId: pendingApproval.driverId,
          approved: pendingApproval.newStatus,
        }),
      });

      if (!response.ok) {
        // Revert the optimistic update
        setDrivers(currentDrivers =>
          currentDrivers.map(driver =>
            driver.Id === pendingApproval.driverId
              ? { ...driver, Approved: !pendingApproval.newStatus }
              : driver
          )
        );
        throw new Error('Failed to update driver status');
      }

      toast.success(`Driver ${pendingApproval.newStatus ? 'approved' : 'unapproved'} successfully`);
    } catch (error) {
      console.error('Error updating driver approval:', error);
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">Loading...</TableCell>
                  </TableRow>
                ) : drivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">No drivers found.</TableCell>
                  </TableRow>
                ) : (
                  drivers.map((driver) => (
                    <TableRow key={driver.Id}>
                      <TableCell className="max-w-[180px] truncate font-semibold">{driver.LegalName}</TableCell>
                      <TableCell>{driver.PhoneNumber}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{driver.Email}</TableCell>
                      <TableCell><Badge variant="secondary">{driver.Vehicle || 'N/A'}</Badge></TableCell>
                      <TableCell><Badge variant="outline">{driver.Plate}</Badge></TableCell>
                      <TableCell><Badge variant="default">{driver.total_rides || 0}</Badge></TableCell>
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
                                  <Badge variant="secondary">{driver.Vehicle || 'N/A'}</Badge>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Car Number</div>
                                  <Badge variant="outline">{driver.Plate}</Badge>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Seats</div>
                                  <Badge variant="outline">{driver.Seats || 'N/A'}</Badge>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Total Rides</div>
                                  <Badge variant="default">{driver.total_rides || 0}</Badge>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Price</div>
                                  <div className="font-medium">{driver.Price || 'N/A'}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">MoMo Code</div>
                                  <div className="font-medium">{driver.MomoCode || 'N/A'}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Active Status</div>
                                  <Badge variant={driver.IsActive ? 'default' : 'secondary'}>
                                    {driver.IsActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                                <div className="col-span-2">
                                  <div className="text-xs text-gray-500 mb-2">National ID</div>
                                  <div className="border rounded-lg p-4 bg-gray-50">
                                    {driver.NationalId ? (
                                      <img
                                        src={getImageUrl(driver.NationalId) || ''}
                                        alt="National ID"
                                        className="rounded-lg max-h-[200px] object-contain"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                        }}
                                      />
                                    ) : null}
                                    <div className={`text-gray-500 italic ${driver.NationalId ? 'hidden' : ''}`}>
                                      {driver.NationalId ? 'Failed to load image' : 'Not provided'}
                                    </div>
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
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                        }}
                                      />
                                    ) : null}
                                    <div className={`text-gray-500 italic ${driver.DrivingPermit ? 'hidden' : ''}`}>
                                      {driver.DrivingPermit ? 'Failed to load image' : 'Not provided'}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <div className="text-xs text-gray-500 mb-2">Vehicle Image</div>
                                  <div className="border rounded-lg p-4 bg-gray-50">
                                    {driver.VehicleImage ? (
                                      <img
                                        src={getImageUrl(driver.VehicleImage) || ''}
                                        alt="Vehicle"
                                        className="rounded-lg max-h-[200px] object-contain"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                        }}
                                      />
                                    ) : null}
                                    <div className={`text-gray-500 italic ${driver.VehicleImage ? 'hidden' : ''}`}>
                                      {driver.VehicleImage ? 'Failed to load image' : 'Not provided'}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <div className="text-xs text-gray-500 mb-2">Insurance Document</div>
                                  <div className="border rounded-lg p-4 bg-gray-50">
                                    {driver.InsuranceDocument ? (
                                      <img
                                        src={getImageUrl(driver.InsuranceDocument) || ''}
                                        alt="Insurance Document"
                                        className="rounded-lg max-h-[200px] object-contain"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                        }}
                                      />
                                    ) : null}
                                    <div className={`text-gray-500 italic ${driver.InsuranceDocument ? 'hidden' : ''}`}>
                                      {driver.InsuranceDocument ? 'Failed to load image' : 'Not provided'}
                                    </div>
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
                  ))
                )}
              </TableBody>
            </Table>
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