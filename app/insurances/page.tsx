'use client';

import { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';

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
  Psv: string | null;
  Usage: string | null;
  Insurer: string | null;
  DriverName?: string;
}

export default function DriverInsurances() {
  const [insurances, setInsurances] = useState<DriverInsurance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverInsurances();
  }, []);

  const fetchDriverInsurances = async () => {
    try {
      setLoading(true);
      const { data: insurancesData, error: insurancesError } = await supabase
        .from('DriverInsurance')
        .select(`
          *,
          Driver!inner(LegalName)
        `)
        .order('CreatedAt', { ascending: false });
      if (insurancesError) throw insurancesError;
      const insurancesWithDriverName = insurancesData?.map(insurance => ({
        ...insurance,
        DriverName: insurance.Driver?.LegalName || 'Unknown Driver'
      })) || [];
      setInsurances(insurancesWithDriverName);
    } catch (error) {
      alert('Failed to load driver insurances');
    } finally {
      setLoading(false);
    }
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insurances.map((insurance) => (
                  <TableRow key={insurance.Id}>
                    <TableCell className="min-w-[180px] truncate font-semibold">{insurance.DriverName}</TableCell>
                    <TableCell>{insurance.PolicyNo}</TableCell>
                    <TableCell><Badge variant="secondary">{insurance.Insurer}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{insurance.MarkType}</Badge></TableCell>
                    <TableCell>{insurance.InceptionDate ? new Date(insurance.InceptionDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className={insurance.ExpiryDate && new Date(insurance.ExpiryDate) < new Date() ? 'text-red-600' : ''}>
                      {insurance.ExpiryDate ? new Date(insurance.ExpiryDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button key={insurance.Id + '-trigger'} variant="link" size="sm">
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent key={insurance.Id + '-dialog'} className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Insurance Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div key={insurance.Id + '-driver'}>
                                <div className="text-xs text-gray-500">Driver Name</div>
                                <div className="font-medium">{insurance.DriverName}</div>
                              </div>
                              <div key={insurance.Id + '-policy'}>
                                <div className="text-xs text-gray-500">Policy Number</div>
                                <div className="font-medium">{insurance.PolicyNo}</div>
                              </div>
                              <div key={insurance.Id + '-insurer'}>
                                <div className="text-xs text-gray-500">Insurer</div>
                                <Badge variant="secondary">{insurance.Insurer}</Badge>
                              </div>
                              <div key={insurance.Id + '-marktype'}>
                                <div className="text-xs text-gray-500">Mark Type</div>
                                <Badge variant="outline">{insurance.MarkType}</Badge>
                              </div>
                              <div key={insurance.Id + '-chassis'}>
                                <div className="text-xs text-gray-500">Chassis</div>
                                <div className="font-medium">{insurance.Chassis || 'N/A'}</div>
                              </div>
                              <div key={insurance.Id + '-psv'}>
                                <div className="text-xs text-gray-500">PSV</div>
                                <div className="font-medium">{insurance.Psv || 'N/A'}</div>
                              </div>
                              <div key={insurance.Id + '-usage'}>
                                <div className="text-xs text-gray-500">Usage</div>
                                <div className="font-medium">{insurance.Usage || 'N/A'}</div>
                              </div>
                              <div key={insurance.Id + '-inception'}>
                                <div className="text-xs text-gray-500">Inception Date</div>
                                <div className="font-medium">{insurance.InceptionDate ? new Date(insurance.InceptionDate).toLocaleDateString() : 'N/A'}</div>
                              </div>
                              <div key={insurance.Id + '-expiry'}>
                                <div className="text-xs text-gray-500">Expiry Date</div>
                                <div className={insurance.ExpiryDate && new Date(insurance.ExpiryDate) < new Date() ? 'font-medium text-red-600' : 'font-medium'}>
                                  {insurance.ExpiryDate ? new Date(insurance.ExpiryDate).toLocaleDateString() : 'N/A'}
                                </div>
                              </div>
                              <div className="col-span-2" key={insurance.Id + '-doc'}>
                                <div className="text-xs text-gray-500 mb-2">Insurance Document</div>
                                <div className="border rounded-lg p-4 bg-gray-50">
                                  {insurance.InsuranceDocument ? (
                                    <img
                                      src={insurance.InsuranceDocument}
                                      alt="Insurance Document"
                                      className="rounded-lg max-h-[200px] object-contain"
                                    />
                                  ) : (
                                    <div className="text-gray-500 italic">No document uploaded</div>
                                  )}
                                </div>
                              </div>
                              <div key={insurance.Id + '-created'}>
                                <div className="text-xs text-gray-500">Created At</div>
                                <div className="font-medium">{new Date(insurance.CreatedAt).toLocaleDateString()}</div>
                              </div>
                              <div key={insurance.Id + '-updated'}>
                                <div className="text-xs text-gray-500">Last Updated</div>
                                <div className="font-medium">{insurance.UpdatedOn ? new Date(insurance.UpdatedOn).toLocaleDateString() : 'N/A'}</div>
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
            {!loading && insurances.length === 0 && <div className="p-4 text-center text-gray-500">No insurances found.</div>}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}