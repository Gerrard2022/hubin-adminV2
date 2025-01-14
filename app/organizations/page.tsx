'use client';

import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import MainLayout from "@/components/layout/MainLayout";
import Image from 'next/image';

interface Organization {
  type: string;
  id: string;
  name: string;
  owner: string;
  created_at: string;
  image?: string;
}

export default function Organizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    owner: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setOrganizations(data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      alert('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data, error: uploadError } = await supabase.storage
      .from('organizations')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('organizations')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = editingOrganization?.image || '';

      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      if (editingOrganization) {
        const { error } = await supabase
          .from('organizations')
          .update({
            name: formData.name,
            type: formData.type,
            owner: formData.owner,
            image: imageUrl || null,
          })
          .eq('id', editingOrganization.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('organizations')
          .insert([{
            name: formData.name,
            type: formData.type,
            owner: formData.owner,
            image: imageUrl || null,
          }]);

        if (error) throw error;
      }

      setModalOpen(false);
      resetForm();
      fetchOrganizations();
    } catch (error: any) {
      console.error('Error saving organization:', error);
      alert(error.message || 'Failed to save organization');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', owner: '', type: '' });
    setSelectedImage(null);
    setPreviewUrl('');
    setEditingOrganization(null);
  };

  const handleEdit = (org: Organization) => {
    setEditingOrganization(org);
    setFormData({
      name: org.name,
      owner: org.owner,
      type: org.type,
    });
    if (org.image) {
      setPreviewUrl(org.image);
    }
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this organization?')) {
      try {
        const { error } = await supabase
          .from('organizations')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchOrganizations();
      } catch (error) {
        console.error('Error deleting organization:', error);
        alert('Failed to delete organization');
      }
    }
  };

  return (
    <MainLayout>
<div className="p-6">
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b flex justify-between items-center">
      <h1 className="text-2xl font-semibold">Organizations</h1>
      <button
        onClick={() => setModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Create Organization
      </button>
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {organizations.map((org) => (
            <tr key={org.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                {org.image ? (
                  <div className="w-12 h-12 relative">
                    <Image
                      src={org.image}
                      alt={org.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-500">No Image</span>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{org.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{org.owner}</td>
              <td className="px-6 py-4 whitespace-nowrap">{org.type}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(org.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleEdit(org)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(org.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  {/* Modal */}
  {modalOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">
          {editingOrganization ? 'Edit Organization' : 'Create Organization'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <div className="flex items-center space-x-4">
              {(previewUrl || selectedImage) && (
                <div className="w-20 h-20 relative">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner Name
            </label>
            <input
              type="text"
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {editingOrganization ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
</div>

    </MainLayout>
  );
}