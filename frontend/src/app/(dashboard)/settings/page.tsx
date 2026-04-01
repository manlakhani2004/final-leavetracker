'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, themes, ThemeName } from '@/contexts/ThemeContext';
import { organizationService } from '@/lib/services';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';

export default function SettingsPage() {
  const { organization, user } = useAuth();
  const { theme: currentTheme, setTheme } = useTheme();
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

  const handleThemeChange = (themeName: ThemeName) => {
    setTheme(themeName);
    toast.success(`Theme changed to ${themes.find(t => t.name === themeName)?.label}`, {
      icon: '🎨',
      style: {
        borderRadius: '16px',
        padding: '12px 20px',
      },
    });
  };



  return (
    <div>
      <h1 
        className="text-2xl font-bold mb-6"
        style={{ color: 'var(--text-primary)' }}
      >
        Settings
      </h1>

      {/* =============================================
          THEME / APPEARANCE SECTION
          ============================================= */}
      <div className="modern-card p-6 mb-8">
        <h3 
          className="text-base font-semibold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Theme
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {themes.map((themeOption) => {
            const isSelected = currentTheme === themeOption.name;
            
            return (
              <button
                key={themeOption.name}
                onClick={() => handleThemeChange(themeOption.name)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl border transition-all text-left"
                style={{
                  background: isSelected ? 'var(--primary-light)' : 'var(--surface)',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                }}
              >
                {/* Color dots */}
                <div className="flex gap-1 shrink-0">
                  <div className="h-4 w-4 rounded-full" style={{ background: themeOption.preview.primary }} />
                  <div className="h-4 w-4 rounded-full" style={{ background: themeOption.preview.secondary }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {themeOption.label}
                  </p>
                </div>
                {isSelected && (
                  <Check size={14} className="shrink-0 ml-auto" style={{ color: 'var(--primary)' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =============================================
          ORGANIZATION SETTINGS SECTION (Admin Only)
          ============================================= */}
      {user?.role === 'org_admin' && organization && (
      <div className="max-w-3xl modern-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 
              className="text-lg font-medium pb-2"
              style={{ 
                color: 'var(--text-primary)',
                borderBottom: `1px solid var(--border)`
              }}
            >
              Basic Information
            </h3>
            
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
            <h3 
              className="text-lg font-medium pb-2"
              style={{ 
                color: 'var(--text-primary)',
                borderBottom: `1px solid var(--border)`
              }}
            >
              Working Days
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {workingDaysOptions.map((day) => (
                <label key={day} className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedWorkingDays.includes(day)}
                    onChange={() => toggleWorkingDay(day)}
                    className="h-4 w-4 rounded"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span 
                    className="ml-2 text-sm group-hover:font-medium transition-all"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {day}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 
              className="text-lg font-medium pb-2"
              style={{ 
                color: 'var(--text-primary)',
                borderBottom: `1px solid var(--border)`
              }}
            >
              Advanced Settings
            </h3>
            
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
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
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
        <div className="mt-8 pt-6" style={{ borderTop: `1px solid var(--border)` }}>
          <h3 
            className="text-lg font-medium mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Organization Details
          </h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Organization ID</dt>
              <dd className="mt-1 text-sm" style={{ color: 'var(--text-primary)' }}>{organization._id || organization.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Created</dt>
              <dd className="mt-1 text-sm" style={{ color: 'var(--text-primary)' }}>
                {organization.createdAt ? new Date(organization.createdAt).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Status</dt>
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
      )}
    </div>
  );
}
