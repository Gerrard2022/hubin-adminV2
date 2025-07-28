'use client';

import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Settings, Trash2 } from 'lucide-react';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface FeatureFlag {
  id: number;
  feature_name: string;
  is_enabled: boolean;
}

export default function FeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newFlag, setNewFlag] = useState({ feature_name: '', is_enabled: false });

  useEffect(() => {
    fetchFeatureFlags();
  }, []);

  const fetchFeatureFlags = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/feature-flags', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to fetch feature flags');

      const data = await response.json();
      setFlags(data);
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      toast.error('Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatureFlag = async (featureName: string) => {
    try {
      setUpdating(featureName);
      const response = await fetch(`/api/feature-flags/${encodeURIComponent(featureName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },

      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle feature flag');
      }
  
      const updatedFlag = await response.json();
      setFlags(prev => prev.map(flag => 
        flag.feature_name === updatedFlag.feature_name || flag.id === updatedFlag.id
          ? updatedFlag
          : flag
      ));
  
      toast.success(`${updatedFlag.feature_name} ${updatedFlag.is_enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling feature flag:', error);
      toast.error('Failed to toggle feature flag');
    } finally {
      setUpdating(null);
    }
  };

  const createFeatureFlag = async () => {
    if (!newFlag.feature_name.trim()) {
      toast.error('Feature name is required');
      return;
    }

    try {
      const response = await fetch('/api/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFlag),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create feature flag');
      }

      const createdFlag = await response.json();
      setFlags(prev => [...prev, createdFlag].sort((a, b) => a.feature_name.localeCompare(b.feature_name)));
      setNewFlag({ feature_name: '', is_enabled: false });
      setDialogOpen(false);
      toast.success('Feature flag created successfully');
    } catch (error) {
      console.error('Error creating feature flag:', error);
      let message = 'Failed to create feature flag';
      if (error instanceof Error) {
        message = error.message || message;
      }
      toast.error(message);
    }
  };

  const deleteFeatureFlag = async (featureName: string) => {
    if (!confirm(`Are you sure you want to delete "${featureName}"?`)) return;

    try {
      const response = await fetch(`/api/feature-flags/${encodeURIComponent(featureName)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to delete feature flag');

      setFlags(prev => prev.filter(flag => flag.feature_name !== featureName));
      toast.success('Feature flag deleted successfully');
    } catch (error) {
      console.error('Error deleting feature flag:', error);
      toast.error('Failed to delete feature flag');
    }
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <Settings size={20} />
              Feature Flags
            </h5>
            <p className="text-sm text-muted-foreground">Toggle application features on/off</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus size={16} />
                Add Flag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Feature Flag</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="feature_name">Feature Name</Label>
                  <Input
                    id="feature_name"
                    value={newFlag.feature_name}
                    onChange={(e) => setNewFlag(prev => ({ ...prev, feature_name: e.target.value }))}
                    placeholder="e.g., payments, notifications, dark_mode"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enabled"
                    checked={newFlag.is_enabled}
                    onCheckedChange={(is_enabled) => setNewFlag(prev => ({ ...prev, is_enabled }))}
                  />
                  <Label htmlFor="enabled">Enable by default</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={createFeatureFlag}>Create Flag</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        ) : flags.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Settings size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No Feature Flags</p>
            <p className="text-sm">Create your first feature flag to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {flags.map((flag) => (
              <div key={flag.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium text-sm">{flag.feature_name}</div>
                    <div>
                      <Badge variant={flag.is_enabled ? 'default' : 'secondary'} className="text-xs">
                        {flag.is_enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-2">ID: {flag.id}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={flag.is_enabled}
                    onCheckedChange={() => toggleFeatureFlag(flag.feature_name)}
                    disabled={updating === flag.feature_name}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteFeatureFlag(flag.feature_name)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
