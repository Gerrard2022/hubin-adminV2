'use client';

import { useState, useEffect, useRef } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import MainLayout from "@/components/layout/MainLayout";
import { createFeaturedLocation, deleteFeaturedLocation, fetchFeaturedLocations, updateFeaturedLocation } from './actions';
import { ApprovalPopup } from '@/components/ApprovalPopup';   

interface FeaturedLocation {
  Id: string; 
  CreatedAt: string;
  Title: string;
  SubTitle: string;
  Image: string;
  AddressId?: string;
}

export default function FeaturedLocations() {
  const [locations, setLocations] = useState<FeaturedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({ Title: '', SubTitle: '', Image: '', AddressId: '' });
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingLocation, setEditingLocation] = useState<FeaturedLocation | null>(null);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await fetchFeaturedLocations();
      setLocations(data);
    } catch (error) {
      toast.error('Failed to load featured locations');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      setLoading(true);
      await deleteFeaturedLocation(id);
      setLocations(prev => prev.filter(loc => loc.Id !== id));
      toast.success('Location deleted');
    } catch (error) {
      toast.error('Failed to delete location');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImageToUploadThing = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('files', file);
    
    const response = await fetch('/api/uploadthing', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const data = await response.json();
    return data[0]?.url || data.url;
  };

  const handleOpenModal = (location?: FeaturedLocation) => {
    if (location) {
      setForm({ 
        Title: location.Title, 
        SubTitle: location.SubTitle, 
        Image: location.Image,
        AddressId: location.AddressId || ''
      });
      setEditingLocation(location);
      setImageFile(null);
    } else {
      setForm({ Title: '', SubTitle: '', Image: '', AddressId: '' });
      setEditingLocation(null);
      setImageFile(null);
    }
    setModalOpen(true);
  };

  const handleSubmitLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.Title || !form.SubTitle || (!editingLocation && !imageFile)) {
      toast.error('Please fill all fields and upload an image');
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl = form.Image;
      
      
      if (imageFile) {
        imageUrl = await uploadImageToUploadThing(imageFile);
      }

      const locationData = {
        Title: form.Title,
        SubTitle: form.SubTitle,
        Image: imageUrl,
        AddressId: form.AddressId || undefined,
      };

      if (editingLocation) {
        const updated = await updateFeaturedLocation(editingLocation.Id, locationData);
        if (updated) {
          setLocations(prev => prev.map(loc => loc.Id === updated.Id ? updated : loc));
          toast.success('Featured location updated successfully');
        }
      } else {
        const newLocation = await createFeaturedLocation(locationData);
        if (newLocation) {
          setLocations(prevLocations => [newLocation, ...prevLocations]);
          toast.success('Featured location created successfully');
        }
      }
      
      setModalOpen(false);
      setForm({ Title: '', SubTitle: '', Image: '', AddressId: '' });
      setImageFile(null);
      setEditingLocation(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save location');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="bg-white rounded-lg shadow border">
          <div className="flex justify-between items-center p-6 border-b">
            <h4 className="text-lg font-semibold m-0">Featured Locations</h4>
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenModal()} className="ml-4">Add New Location</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingLocation ? 'Edit Featured Location' : 'Add New Featured Location'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitLocation} className="space-y-4">
                  <div>
                    <label className="block font-medium mb-1">Title</label>
                    <Input
                      value={form.Title}
                      onChange={e => setForm(f => ({ ...f, Title: e.target.value }))}
                      placeholder="Enter location title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Subtitle</label>
                    <Input
                      value={form.SubTitle}
                      onChange={e => setForm(f => ({ ...f, SubTitle: e.target.value }))}
                      placeholder="Enter location subtitle"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Address ID (Optional)</label>
                    <Input
                      value={form.AddressId}
                      onChange={e => setForm(f => ({ ...f, AddressId: e.target.value }))}
                      placeholder="Enter address ID"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Location Image</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                      required={!editingLocation}
                    />
                    {editingLocation && !imageFile && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Current image:</span>
                        <img
                          src={editingLocation.Image}
                          alt="Current"
                          className="w-20 h-20 object-cover rounded mt-1"
                        />
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={submitting} className="w-full">
                      {submitting ? (editingLocation ? 'Saving...' : 'Creating...') : (editingLocation ? 'Save Changes' : 'Create Featured Location')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Subtitle</TableHead>
                  <TableHead>Address ID</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((loc) => (
                  <TableRow key={loc.Id}>
                    <TableCell>
                      <img
                        src={loc.Image}
                        alt="Location"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </TableCell>
                    <TableCell className="font-semibold">{loc.Title}</TableCell>
                    <TableCell>{loc.SubTitle}</TableCell>
                    <TableCell>{loc.AddressId || 'N/A'}</TableCell>
                    <TableCell>{new Date(loc.CreatedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleOpenModal(loc)} disabled={loading}>
                          Edit
                        </Button>
                        <ApprovalPopup
                          Description="Are you sure you want to delete this featured location? This action cannot be undone."
                          Title="Delete Featured Location"
                          Trigger={
                            <Button variant="destructive" size="sm" disabled={loading}>
                              Delete
                            </Button>
                          }
                          OnConfirm={() => handleDeleteLocation(loc.Id)}
                          OnCancel={() => {}}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {loading && <div className="p-4 text-center text-gray-500">Loading...</div>}
            {!loading && locations.length === 0 && <div className="p-4 text-center text-gray-500">No featured locations found.</div>}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}