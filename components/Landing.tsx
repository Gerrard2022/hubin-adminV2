'use client';

import Link from 'next/link';
import { Car, Users, BarChart3, Shield, Clock, MapPin } from 'lucide-react';
import { ClerkProvider, SignInButton, SignedOut } from '@clerk/nextjs';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-900">HubinAdmin</span>
            </div>
            <SignedOut>
              <SignInButton />
            </SignedOut>
          </div>
        </div>
      </header>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-green-900 mb-6">
            Manage Your Ride-Sharing
            <span className="text-green-600 block">Business Efficiently</span>
          </h1>
          <p className="text-xl text-green-600 mb-8 max-w-3xl mx-auto">
            Comprehensive admin dashboard to track rides, manage drivers, monitor revenue, 
            and grow your transportation business with powerful analytics and insights.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-green-600">Powerful tools to manage and grow your ride-sharing business</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl border border-green-200">
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">Analytics Dashboard</h3>
              <p className="text-green-600">Real-time insights into rides, revenue, and business performance with interactive charts and reports.</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl border border-green-200">
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">Driver Management</h3>
              <p className="text-green-600">Efficiently manage your driver fleet, track performance, and handle registrations seamlessly.</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl border border-green-200">
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">Ride Tracking</h3>
              <p className="text-green-600">Monitor all rides in real-time, track routes, and ensure customer satisfaction.</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl border border-green-200">
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">Insurance Management</h3>
              <p className="text-green-600">Handle insurance claims, policies, and ensure compliance with safety regulations.</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl border border-green-200">
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">24/7 Support</h3>
              <p className="text-green-600">Round-the-clock customer support system to handle queries and resolve issues quickly.</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl border border-green-200">
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Car className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">Fleet Overview</h3>
              <p className="text-green-600">Complete visibility of your vehicle fleet with maintenance schedules and performance metrics.</p>
            </div>
          </div>
        </div>
      </section>
      <footer className="bg-green-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Car className="h-6 w-6 text-green-400" />
              <span className="text-xl font-bold">HubinAdmin</span>
            </div>
            <div className="text-green-200 text-sm">
              © 2024 HubinAdmin. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
