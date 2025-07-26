'use client';

import { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';

interface SupportRequest {
  Id: number;
  CreatedAt: string;
  Message: string;
  ContactInfo: string;
  Status: string;
  Subject: string;
  UserId: string;
}

export default function SupportRequests() {
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupportRequests();
  }, []);

  const fetchSupportRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('SupportRequests')
        .select('*')
        .eq('Status', 'pending')
        .order('CreatedAt', { ascending: false });
      if (error) throw error;
      setSupportRequests(data || []);
    } catch (error) {
      alert('Failed to load support requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: number, newStatus: string) => {
    try {
      setSupportRequests(currentRequests => 
        currentRequests.filter(request => request.Id !== requestId)
      );
      const { error } = await supabase
        .from('SupportRequests')
        .update({ Status: newStatus })
        .eq('Id', requestId);
      if (error) {
        fetchSupportRequests();
        throw error;
      }
      alert(`Support request marked as ${newStatus}`);
    } catch (error) {
      alert('Failed to update support request status');
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h4 className="text-lg font-semibold m-0">Pending Support Requests</h4>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Subject</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supportRequests.map((request) => (
                  <TableRow key={request.Id}>
                    <TableCell className="min-w-[180px] truncate font-semibold">{request.Subject}</TableCell>
                    <TableCell>{request.ContactInfo}</TableCell>
                    <TableCell>{new Date(request.CreatedAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {request.Status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button key={request.Id + '-trigger'} variant="link" size="sm">
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent key={request.Id + '-dialog'} className="max-w-xl">
                          <DialogHeader>
                            <DialogTitle>Support Request Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div key={request.Id + '-subject'}>
                                <div className="text-xs text-gray-500">Subject</div>
                                <div className="font-medium">{request.Subject}</div>
                              </div>
                              <div key={request.Id + '-contact'}>
                                <div className="text-xs text-gray-500">Contact Info</div>
                                <div className="font-medium">{request.ContactInfo}</div>
                              </div>
                              <div className="col-span-2" key={request.Id + '-message'}>
                                <div className="text-xs text-gray-500">Message</div>
                                <div className="border rounded-lg p-4 bg-gray-50">{request.Message}</div>
                              </div>
                              <div key={request.Id + '-created'}>
                                <div className="text-xs text-gray-500">Created At</div>
                                <div className="font-medium">{new Date(request.CreatedAt).toLocaleString()}</div>
                              </div>
                              <div key={request.Id + '-status'}>
                                <div className="text-xs text-gray-500">Update Status</div>
                                <div>
                                  <select
                                    className="w-full border rounded px-2 py-1"
                                    value={request.Status}
                                    onChange={(e) => handleStatusChange(request.Id, e.target.value)}
                                  >
                                    <option value="answered">Answered</option>
                                    <option value="pending">Pending</option>
                                  </select>
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
            {!loading && supportRequests.length === 0 && <div className="p-4 text-center text-gray-500">No pending requests found.</div>}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}