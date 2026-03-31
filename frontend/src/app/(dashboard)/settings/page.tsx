'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { organizationService } from '@/lib/services';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { organization, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: organization?.name || '',
    domain: organization?.domain || '',
    address: organization?.address || '',
    timezone: organization?.settings?.timezone || 'UTC',
    leaveYearStart: organization?.settings?.leaveYearStart?.toString() || '1',
  });

  const workingDaysOptions = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];
  
  const [selectedWorkingDays, setSelectedWorkingDays] = useState<string[]>(
    organization?.settings?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    setLoading(true);
    try {
      await organizationService.updateOrganization(organization?._id || organization?.id, {
        name: formData.name,
        domain: formData.domain,
        address: formData.address,
        settings: {
          timezone: formData.timezone,
          leaveYearStart: parseInt(formData.leaveYearStart),
          workingDays: selectedWorkingDays,
        },
      });
      toast.success('Settings updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkingDay = (day: string) => {
    setSelectedWorkingDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!organization) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Organization Settings</h1>

      <div className="max-w-3xl bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
            
            <Input
              label="Organization Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            
            <Input
              label="Domain"
              name="domain"
              value={formData.domain}
              onChange={handleChange}
              placeholder="company.com"
            />
            
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Company address..."
            />
          </div>

          {/* Working Days */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Working Days</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {workingDaysOptions.map((day) => (
                <label key={day} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedWorkingDays.includes(day)}
                    onChange={() => toggleWorkingDay(day)}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{day}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Advanced Settings</h3>
            
            <Input
              label="Timezone"
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              placeholder="UTC"
            />
            
            <Input
              label="Leave Year Start Month"
              name="leaveYearStart"
              type="number"
              min="1"
              max="12"
              value={formData.leaveYearStart}
              onChange={handleChange}
              placeholder="1 (January)"
            />
            <p className="text-sm text-gray-500">
              Month number (1-12) when the leave year starts. January = 1, December = 12.
            </p>
          </div>

          <div className="pt-4">
            <Button type="submit" isLoading={loading} className="w-full">
              Save Settings
            </Button>
          </div>
        </form>

        {/* Organization Info Display */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Details</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Organization ID</dt>
              <dd className="mt-1 text-sm text-gray-900">{organization._id || organization.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {organization.createdAt ? new Date(organization.createdAt).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  organization.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {organization.isActive ? 'Active' : 'Inactive'}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
