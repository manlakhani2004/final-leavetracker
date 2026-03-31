'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/services';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    organizationName: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    domain: '',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await authService.registerOrg(formData);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      toast.success('Registration successful!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register Organization
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create a new organization account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Organization Name"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              required
              placeholder="Enter organization name"
            />
            <Input
              label="Admin Name"
              name="adminName"
              value={formData.adminName}
              onChange={handleChange}
              required
              placeholder="Enter your name"
            />
            <Input
              label="Email Address"
              name="adminEmail"
              type="email"
              value={formData.adminEmail}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
            <Input
              label="Password"
              name="adminPassword"
              type="password"
              value={formData.adminPassword}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Create a password"
            />
            <Input
              label="Domain (Optional)"
              name="domain"
              value={formData.domain}
              onChange={handleChange}
              placeholder="Enter company domain"
            />
            <Input
              label="Address (Optional)"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter company address"
            />
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
          >
            Register
          </Button>

          <div className="text-center">
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
