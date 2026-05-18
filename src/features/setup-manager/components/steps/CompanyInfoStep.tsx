import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Building2, Save, Download, Upload, X } from 'lucide-react';
import type { StepComponentProps } from '../setupManagerTypes';
import { toast } from 'sonner';
import api from '@/utils/axios'; // Your existing API instance

// Backend interface to match Laravel API response
interface BackendCompanyInfo {
  id?: number;
  company_name: string;
  company_logo?: string | null;
  industry: string;
  founded_year: string;
  website: string;
  company_mission: string;
  company_vision: string;
  registration_number: string;
  tax_id_ein: string;
  primary_email: string;
  phone_number: string;
  street_address: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  created_at?: string;
  updated_at?: string;
}

interface CompanyInfoResponse {
  isSuccess: boolean;
  data: BackendCompanyInfo;
  updated_by?: number;
}

export const CompanyInfoStep: React.FC<StepComponentProps> = ({ setupData, setSetupData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  // Convert backend data to frontend format
  const backendToFrontendFormat = (backendData: BackendCompanyInfo) => {
    return {
      companyName: backendData.company_name || '',
      companyLogo: backendData.company_logo || '',
      industry: backendData.industry || '',
      foundedYear: backendData.founded_year?.toString() || '',
      website: backendData.website || '',
      companyMission: backendData.company_mission || '',
      companyVision: backendData.company_vision || '',
      registrationNumber: backendData.registration_number || '',
      taxId: backendData.tax_id_ein || '',
      primaryEmail: backendData.primary_email || '',
      phoneNumber: backendData.phone_number || '',
      address: backendData.street_address || '',
      city: backendData.city || '',
      state: backendData.state_province || '',
      postalCode: backendData.postal_code || '',
      country: backendData.country || '',
    };
  };

  // Convert frontend data to backend format
  const frontendToBackendFormat = (frontendData: any): Partial<BackendCompanyInfo> => {
    return {
      company_name: frontendData.companyName,
      industry: frontendData.industry,
      founded_year: frontendData.foundedYear,
      website: frontendData.website,
      company_mission: frontendData.companyMission,
      company_vision: frontendData.companyVision,
      registration_number: frontendData.registrationNumber,
      tax_id_ein: frontendData.taxId,
      primary_email: frontendData.primaryEmail,
      phone_number: frontendData.phoneNumber,
      street_address: frontendData.address,
      city: frontendData.city,
      state_province: frontendData.state,
      postal_code: frontendData.postalCode,
      country: frontendData.country,
    };
  };

  // Load company information from backend
  const loadCompanyInfo = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/company-information');
      const backendData: BackendCompanyInfo = response.data;

      if (backendData) {
        const frontendData = backendToFrontendFormat(backendData);
        setSetupData({ ...setupData, ...frontendData });

        // Set logo preview if exists
        if (backendData.company_logo) {
          setLogoPreview(backendData.company_logo);
        }

      }

      return backendData;
    } catch (error: any) {
      console.error('Failed to load company information:', error);

      // Don't show error if it's 404 (no data yet)
      if (error.response?.status !== 404) {
        toast.error('Failed to load company information');
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }

      setLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setSetupData({ ...setupData, companyLogo: '' });
  };

  // Save company information to backend
  const saveCompanyInfo = async () => {
    try {
      setIsSaving(true);

      if (logoFile) {
        // Use FormData for file upload
        const formData = new FormData();
        const backendData = frontendToBackendFormat(setupData);

        // Append all fields to FormData
        Object.entries(backendData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });

        // Append logo file
        formData.append('company_logo', logoFile);

        const response = await api.post('/company-information/save', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const result: CompanyInfoResponse = response.data;

        if (result.isSuccess) {
          toast.success('Company information saved successfully');
          // Update logo preview with new logo URL
          if (result.data.company_logo) {
            setLogoPreview(`http://hris-sms.slarenasitsolutions.com/${result.data.company_logo}`);
          }
          setLogoFile(null); // Clear the file after successful upload
          return result;
        } else {
          throw new Error('Failed to save company information');
        }
      } else {
        // No file, send as JSON
        const backendData = frontendToBackendFormat(setupData);
        const response = await api.post('/company-information/save', backendData);
        const result: CompanyInfoResponse = response.data;

        if (result.isSuccess) {
          toast.success('Company information saved successfully');
          return result;
        } else {
          throw new Error('Failed to save company information');
        }
      }
    } catch (error: any) {
      console.error('Failed to save company information:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save company information';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Load company info when component mounts
  useEffect(() => {
    loadCompanyInfo();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Company Information
        </CardTitle>
        <CardDescription>
          Set up your basic company information. Data is automatically saved to your backend server.
        </CardDescription>

        {/* Backend Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            onClick={loadCompanyInfo}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            {isLoading ? 'Loading...' : 'Refresh from Server'}
          </Button>

          <Button
            onClick={saveCompanyInfo}
            size="sm"
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save to Server'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Company Logo */}
        <div className="space-y-4">
          <h3 className="font-medium">Company Logo</h3>
          <div className="flex items-start gap-6">
            {/* Logo Preview */}
            <div className="flex-shrink-0">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={`${logoPreview}`}
                    alt="Company Logo"
                    className="w-32 h-32 rounded-lg object-cover border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                    onClick={handleRemoveLogo}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                  No Logo
                </div>
              )}
            </div>

            {/* Logo Upload */}
            <div className="flex-1 space-y-3">
              <Label htmlFor="companyLogo">Upload Company Logo</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="companyLogo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="flex-1"
                />
                <Upload className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-muted-foreground">
                Recommended: Square image, 500x500px, max 2MB. Supported formats: JPG, PNG, GIF
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="font-medium">Basic Information</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={setupData.companyName}
                onChange={(e) => setSetupData({ ...setupData, companyName: e.target.value })}
                placeholder="Enter your company name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={setupData.industry}
                  onValueChange={(value) => setSetupData({ ...setupData, industry: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Software Development">Software Development</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="foundedYear">Founded Year</Label>
                <Input
                  id="foundedYear"
                  type="number"
                  value={setupData.foundedYear}
                  onChange={(e) => setSetupData({ ...setupData, foundedYear: e.target.value })}
                  placeholder="e.g., 2020"
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={setupData.website}
                  onChange={(e) => setSetupData({ ...setupData, website: e.target.value })}
                  placeholder="https://www.yourcompany.com"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Mission & Vision */}
        <div className="space-y-4">
          <h3 className="font-medium">Mission & Vision</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyMission">Company Mission</Label>
              <Textarea
                id="companyMission"
                value={setupData.companyMission}
                onChange={(e) => setSetupData({ ...setupData, companyMission: e.target.value })}
                placeholder="Enter your company's mission statement..."
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                Define your company's purpose and what you aim to achieve
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyVision">Company Vision</Label>
              <Textarea
                id="companyVision"
                value={setupData.companyVision}
                onChange={(e) => setSetupData({ ...setupData, companyVision: e.target.value })}
                placeholder="Enter your company's vision statement..."
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                Describe your company's long-term aspirations and goals
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Legal Information */}
        <div className="space-y-4">
          <h3 className="font-medium">Legal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                value={setupData.registrationNumber}
                onChange={(e) => setSetupData({ ...setupData, registrationNumber: e.target.value })}
                placeholder="REG-2024-12345"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / EIN</Label>
              <Input
                id="taxId"
                value={setupData.taxId}
                onChange={(e) => setSetupData({ ...setupData, taxId: e.target.value })}
                placeholder="TIN-123456789"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="font-medium">Contact Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryEmail">Primary Email</Label>
                <Input
                  id="primaryEmail"
                  type="email"
                  value={setupData.primaryEmail}
                  onChange={(e) => setSetupData({ ...setupData, primaryEmail: e.target.value })}
                  placeholder="info@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={setupData.phoneNumber}
                  onChange={(e) => setSetupData({ ...setupData, phoneNumber: e.target.value })}
                  placeholder="+63 912 345 6789"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={setupData.address}
                onChange={(e) => setSetupData({ ...setupData, address: e.target.value })}
                placeholder="123 Innovation Street"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={setupData.city}
                  onChange={(e) => setSetupData({ ...setupData, city: e.target.value })}
                  placeholder="Quezon City"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State / Province</Label>
                <Input
                  id="state"
                  value={setupData.state}
                  onChange={(e) => setSetupData({ ...setupData, state: e.target.value })}
                  placeholder="Metro Manila"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={setupData.postalCode}
                  onChange={(e) => setSetupData({ ...setupData, postalCode: e.target.value })}
                  placeholder="1100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={setupData.country}
                  onChange={(e) => setSetupData({ ...setupData, country: e.target.value })}
                  placeholder="Philippines"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Auto-save notice */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center text-sm text-blue-800">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Data is automatically loaded from your server. Click "Save to Server" to persist changes.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};