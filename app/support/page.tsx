'use client';

import { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from "sonner"

interface SupportRequest {
  Id: string;
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
      
      const response = await fetch('/api/support-requests', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch support requests');
      }

      const data = await response.json();
      setSupportRequests(data);
      
    } catch (error) {
      console.error('Error fetching support requests:', error);
      toast.error('Failed to load support requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      // Optimistically update UI
      setSupportRequests(currentRequests => 
        currentRequests.filter(request => request.Id !== requestId)
      );
      
      const response = await fetch('/api/support-requests/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        // Revert optimistic update by refetching
        fetchSupportRequests();
        throw new Error('Failed to update support request status');
      }

      toast.success(`Support request marked as ${newStatus}`);
      
    } catch (error) {
      console.error('Error updating support request:', error);
      toast.error('Failed to update support request status');
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">Loading...</TableCell>
                  </TableRow>
                ) : supportRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">No pending requests found.</TableCell>
                  </TableRow>
                ) : (
                  supportRequests.map((request) => (
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
                            <Button variant="link" size="sm">
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-xl">
                            <DialogHeader>
                              <DialogTitle>Support Request Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs text-gray-500">Subject</div>
                                  <div className="font-medium">{request.Subject}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Contact Info</div>
                                  <div className="font-medium">{request.ContactInfo}</div>
                                </div>
                                <div className="col-span-2">
                                  <div className="text-xs text-gray-500">Message</div>
                                  <div className="border rounded-lg p-4 bg-gray-50 whitespace-pre-wrap">{request.Message}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">User ID</div>
                                  <div className="font-medium text-sm text-gray-600">{request.UserId}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Created At</div>
                                  <div className="font-medium">{new Date(request.CreatedAt).toLocaleString()}</div>
                                </div>
                                <div className="col-span-2">
                                  <div className="text-xs text-gray-500 mb-2">Update Status</div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant={request.Status === 'answered' ? 'default' : 'outline'}
                                      size="sm"
                                      onClick={() => handleStatusChange(request.Id, 'answered')}
                                      disabled={request.Status === 'answered'}
                                    >
                                      Mark as Answered
                                    </Button>
                                    <Button
                                      variant={request.Status === 'pending' ? 'default' : 'outline'}
                                      size="sm"
                                      onClick={() => handleStatusChange(request.Id, 'pending')}
                                      disabled={request.Status === 'pending'}
                                    >
                                      Mark as Pending
                                    </Button>
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