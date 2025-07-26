'use client';

import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';
import * as React from 'react';

interface DashboardTotalCountCardProps {
  title: string;
  total: number;
  icon: React.ReactNode;
  colors: {
    bg: string;
    text: string;
    icon: string;
  };
  percentage?: number;
}

export default function DashboardTotalCountCard({
  title,
  total,
  icon,
  colors,
  percentage
}: DashboardTotalCountCardProps) {
  return (
    <Card className="p-6 rounded-2xl shadow-lg border border-gray-100 bg-white flex flex-col justify-between min-h-[160px] transition-shadow hover:shadow-xl">
      <div className="flex justify-between items-start w-full">
        <div className="flex flex-col gap-2">
          <span className="text-gray-500 text-sm font-medium tracking-wide uppercase">{title}</span>
          <h3 className="text-3xl font-semibold text-gray-900">{total.toLocaleString()}</h3>
          {percentage !== undefined && (
            <div className="flex items-center gap-2 mt-1">
              {percentage >= 0 ? (
                <ArrowUp className="text-green-500 w-4 h-4" />
              ) : (
                <ArrowDown className="text-red-500 w-4 h-4" />
              )}
              <span className={percentage >= 0 ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
                {Math.abs(percentage)}%
              </span>
              <span className="text-gray-400 text-xs">vs last month</span>
            </div>
          )}
        </div>
        <div 
          className="flex items-center justify-center w-12 h-12 rounded-full shadow bg-opacity-10"
          style={{ backgroundColor: colors.bg }}
        >
          <span className="text-2xl" style={{ color: colors.icon }}>{icon}</span>
        </div>
      </div>
    </Card>
  );
} 