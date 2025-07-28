'use client';

import { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from "sonner"

interface DriverInsurance {
  Id: string;
  CreatedAt: string;
  DriverId: string;
  UpdatedOn: string | null;
  InsuranceDocument: string | null;
  PolicyNo: string | null;
  InceptionDate: string | null;
  ExpiryDate: string | null;
  MarkType: string | null;
  Chassis: string | null;
  PSV: string | null; 
  Usage: string | null;
  Insurer: string | null;
  DriverName?: string;
}

const getImageUrl = (imagePath: string | null | undefined) => {
  if (!imagePath) return null;
  
  return imagePath;
};

export default function DriverInsurances() {
  const [insurances, setInsurances] = useState<DriverInsurance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverInsurances();
  }, []);

  const fetchDriverInsurances = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/driver-insurances', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch driver insurances');
      }

      const data = await response.json();
      setInsurances(data);
      
    } catch (error) {
      console.error('Error fetching driver insurances:', error);
      toast.error('Failed to load driver insurances');
    } finally {
      setLoading(false);
    }
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    return expiry > today && expiry <= thirtyDaysFromNow;
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h4 className="text-lg font-semibold m-0">Driver Insurances</h4>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Driver Name</TableHead>
                  <TableHead>Policy Number</TableHead>
                  <TableHead>Insurer</TableHead>
                  <TableHead>Mark Type</TableHead>
                  <TableHead>Inception Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">Loading...</TableCell>
                  </TableRow>
                ) : insurances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">No insurances found.</TableCell>
                  </TableRow>
                ) : (
                  insurances.map((insurance) => (
                    <TableRow key={insurance.Id}>
                      <TableCell className="min-w-[180px] truncate font-semibold">
                        {insurance.DriverName || 'Unknown Driver'}
                      </TableCell>
                      <TableCell>{insurance.PolicyNo || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{insurance.Insurer || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{insurance.MarkType || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                        {insurance.InceptionDate ? new Date(insurance.InceptionDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className={isExpired(insurance.ExpiryDate) ? 'text-red-600' : isExpiringSoon(insurance.ExpiryDate) ? 'text-orange-600' : ''}>
                        {insurance.ExpiryDate ? new Date(insurance.ExpiryDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {isExpired(insurance.ExpiryDate) ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : isExpiringSoon(insurance.ExpiryDate) ? (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">Expiring Soon</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                        )}
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
                              <DialogTitle>Insurance Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs text-gray-500">Driver Name</div>
                                  <div className="font-medium">{insurance.DriverName || 'Unknown Driver'}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Policy Number</div>
                                  <div className="font-medium">{insurance.PolicyNo || 'N/A'}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Insurer</div>
                                  <Badge variant="secondary">{insurance.Insurer || 'N/A'}</Badge>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Mark Type</div>
                                  <Badge variant="outline">{insurance.MarkType || 'N/A'}</Badge>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Chassis</div>
                                  <div className="font-medium">{insurance.Chassis || 'N/A'}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">PSV</div>
                                  <div className="font-medium">{insurance.PSV || 'N/A'}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Usage</div>
                                  <div className="font-medium">{insurance.Usage || 'N/A'}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Status</div>
                                  <div>
                                    {isExpired(insurance.ExpiryDate) ? (
                                      <Badge variant="destructive">Expired</Badge>
                                    ) : isExpiringSoon(insurance.ExpiryDate) ? (
                                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">Expiring Soon</Badge>
                                    ) : (
                                      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Inception Date</div>
                                  <div className="font-medium">
                                    {insurance.InceptionDate ? new Date(insurance.InceptionDate).toLocaleDateString() : 'N/A'}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Expiry Date</div>
                                  <div className={isExpired(insurance.ExpiryDate) ? 'font-medium text-red-600' : isExpiringSoon(insurance.ExpiryDate) ? 'font-medium text-orange-600' : 'font-medium'}>
                                    {insurance.ExpiryDate ? new Date(insurance.ExpiryDate).toLocaleDateString() : 'N/A'}
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <div className="text-xs text-gray-500 mb-2">Insurance Document</div>
                                  <div className="border rounded-lg p-4 bg-gray-50">
                                    {insurance.InsuranceDocument ? (
                                      <img
                                        src={getImageUrl(insurance.InsuranceDocument) || ''}
                                        alt="Insurance Document"
                                        className="rounded-lg max-h-[200px] object-contain w-full"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                        }}
                                      />
                                    ) : null}
                                    <div className={`text-gray-500 italic ${insurance.InsuranceDocument ? 'hidden' : ''}`}>
                                      {insurance.InsuranceDocument ? 'Failed to load document' : 'No document uploaded'}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Created At</div>
                                  <div className="font-medium">{new Date(insurance.CreatedAt).toLocaleDateString()}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Last Updated</div>
                                  <div className="font-medium">
                                    {insurance.UpdatedOn ? new Date(insurance.UpdatedOn).toLocaleDateString() : 'Never'}
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
    </MainLayout>
  );
}