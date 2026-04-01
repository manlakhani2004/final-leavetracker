'use client';

import React, { useEffect, useState } from 'react';
import { holidayService } from '@/lib/services';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Calendar, Trash2, Plus, Sparkles, Pencil } from 'lucide-react';

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'national' as 'national' | 'optional',
  });

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const data = await holidayService.getHolidays(currentYear);
      setHolidays(data);
    } catch (error) {
      console.error('Failed to load holidays:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await holidayService.updateHoliday(editingId, formData);
        toast.success('Holiday updated!');
      } else {
        await holidayService.createHoliday(formData);
        toast.success('Holiday created!');
      }
      setModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', date: '', type: 'national' });
      loadHolidays();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${editingId ? 'update' : 'create'} holiday`);
    }
  };

  const handleEdit = (holiday: any) => {
    setEditingId(holiday._id || holiday.id);
    setFormData({
      name: holiday.name,
      date: new Date(holiday.date).toISOString().split('T')[0],
      type: holiday.type,
    });
    setModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ name: '', date: '', type: 'national' });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this holiday?')) return;
    try {
      await holidayService.deleteHoliday(id);
      toast.success('Holiday deleted');
      loadHolidays();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const upcomingHolidays = holidays
    .filter(h => new Date(h.date) >= new Date())
    .slice(0, 3);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Holiday Calendar</h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Manage public holidays and optional leaves for your team</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleAddClick} className="shadow-lg shadow-indigo-200">
            <Plus className="w-4 h-4 mr-2" />
            Add Custom
          </Button>
        </div>
      </div>

      {/* Upcoming Holidays Highlights */}
      {upcomingHolidays.length > 0 && (
        <div className="grid gap-6 md:grid-cols-3">
          {upcomingHolidays.map((holiday, idx) => (
            <div key={idx} className="rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group" style={{ 
              background: 'linear-gradient(135deg, var(--primary-gradient-from), var(--primary-gradient-to))'
            }}>
              <Sparkles className="absolute -right-2 -top-2 w-16 h-16 text-white/10 group-hover:scale-125 transition-transform" />
              <div className="relative z-10">
                <div className="bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-semibold mb-4 backdrop-blur-md">
                   UPCOMING
                </div>
                <h3 className="text-xl font-bold mb-1">{holiday.name}</h3>
                <p className="text-indigo-100 flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(holiday.date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    weekday: 'long' 
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="modern-card rounded-2xl overflow-hidden">
        <div className="px-8 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>All Holidays for {new Date().getFullYear()}</h2>
          <Badge variant="default" className="font-semibold" style={{ 
            backgroundColor: 'var(--surface-secondary)', 
            color: 'var(--text-secondary)',
            border: 'none'
          }}>
            {holidays.length} Total
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
            <thead>
              <tr style={{ background: 'var(--surface-secondary)' }}>
                <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Name</th>
                <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Date</th>
                <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Type</th>
                <th className="px-8 py-4 text-right text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {holidays.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex flex-col items-center">
                      <Calendar className="w-12 h-12 mb-4" style={{ color: 'var(--text-muted)' }} />
                      <p className="font-medium">No holidays scheduled yet.</p>
                      <p className="text-sm">Click 'Add Custom' to add a new holiday for your organization.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                holidays.map((holiday) => (
                  <tr 
                    key={holiday._id || holiday.id} 
                    className="transition-colors"
                    style={{ 
                      borderBottom: `1px solid var(--border)`,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{holiday.name}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <Calendar className="w-4 h-4 mr-2" style={{ color: 'var(--primary)' }} />
                        {new Date(holiday.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <Badge variant={holiday.type === 'national' ? 'approved' : 'pending'} 
                             className={cn(
                               "px-3 py-1 capitalize",
                               holiday.type === 'national' ? '' : ''
                             )}
                             style={{
                               backgroundColor: holiday.type === 'national' ? 'var(--primary-light)' : 'rgba(245, 158, 11, 0.1)',
                               color: holiday.type === 'national' ? 'var(--primary)' : 'rgb(245, 158, 11)',
                               borderColor: holiday.type === 'national' ? 'var(--primary-lighter)' : 'rgba(245, 158, 11, 0.2)'
                             }}>
                        {holiday.type}
                      </Badge>
                    </td>
                    <td className="px-8 py-5 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(holiday)}
                        className="p-2 rounded-lg transition-all"
                        style={{ 
                          color: 'var(--text-muted)',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                          e.currentTarget.style.color = 'var(--primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(holiday._id || holiday.id)}
                        className="p-2 rounded-lg transition-all"
                        style={{ 
                          color: 'var(--text-muted)',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
        }} 
        title={editingId ? "Edit Holiday" : "Add Custom Holiday"}
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <Input label="Holiday Name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Founder's Day" />
          <Input label="Date" name="date" type="date" value={formData.date} onChange={handleChange} required />
          <Select
            label="Category"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={[
              { value: 'national', label: 'National Holiday' },
              { value: 'optional', label: 'Optional / Floating' },
            ]}
          />
          <div className="flex justify-end space-x-3 pt-6 border-t font-semibold">
            <Button type="button" variant="secondary" onClick={() => {
              setModalOpen(false);
              setEditingId(null);
            }}>Cancel</Button>
            <Button type="submit" className="px-8">
              {editingId ? "Update Holiday" : "Save Holiday"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
