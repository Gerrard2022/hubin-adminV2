'use client'

import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import MainLayout from "@/components/layout/MainLayout";
import Image from 'next/image';

interface Organization {
  id: string;
  name: string;
  owner: string;
  type: string;
  created_at: string;
  image?: string;
  totalRevenue?: number; // Add this field to store revenue
}

export default function Organizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchOrganizationsWithRevenue();
  }, []);

  const fetchOrganizationsWithRevenue = async () => {
    try {
      setLoading(true);
  
      // Fetch organizations
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });
  
      if (orgError) throw orgError;
  
      if (orgData) {
        // Fetch ride revenue
        const { data: rideData, error: rideError } = await supabase
          .from('rides')
          .select('organization, fare_price');
  
        if (rideError) throw rideError;
  
        // Calculate total revenue for each organization
        const revenueMap = rideData?.reduce((acc, ride) => {
          if (ride.organization && ride.fare_price) {
            acc[ride.organization] = (acc[ride.organization] || 0) + ride.fare_price;
          }
          return acc;
        }, {} as Record<string, number>);
  
        // Merge 5% revenue into organizations and format it
        const organizationsWithRevenue = orgData.map(org => ({
          ...org,
          totalRevenue: revenueMap[org.id]
            ? (revenueMap[org.id] * 0.05).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : '0.00',
        }));
  
        setOrganizations(organizationsWithRevenue);
      }
    } catch (error) {
      console.error('Error fetching organizations or revenue:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
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
                    <td className="px-6 py-4 whitespace-nowrap">RWF {org.totalRevenue}</td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => console.log('Edit')}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => console.log('Delete')}
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
      </div>
    </MainLayout>
  );
}
