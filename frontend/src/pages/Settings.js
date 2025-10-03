import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Save, User, Bell, Shield, Palette, CreditCard, Download, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../api/users';
import DataExport from '../components/Export/DataExport';
import Toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      currency: user?.currency || 'USD',
      timezone: user?.timezone || 'UTC'
    }
  });

  const { register: registerPreferences, handleSubmit: handlePreferencesSubmit, watch: watchPreferences } = useForm({
    defaultValues: {
      darkMode: user?.preferences?.darkMode || false,
      notifications: {
        email: user?.preferences?.notifications?.email || true,
        push: user?.preferences?.notifications?.push || true,
        budgetAlerts: user?.preferences?.notifications?.budgetAlerts || true
      }
    }
  });

  const onProfileSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await usersAPI.updateProfile(data);
      updateUser(response.data.data.user);
      Toast.success('Profile updated successfully');
    } catch (error) {
      Toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onPreferencesSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await usersAPI.updatePreferences(data);
      updateUser(response.data.data.user);
      Toast.success('Preferences updated successfully');
    } catch (error) {
      Toast.error(error.response?.data?.message || 'Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await usersAPI.deleteAccount();
      Toast.success('Account deleted successfully');
      logout();
    } catch (error) {
      Toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'export', label: 'Data Export', icon: Download },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ];

  const currencies = [
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'
  ];

  const timezones = [
    'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London',
    'Europe/Paris', 'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney'
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-muted mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="card space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-accent-primary text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-primary-light'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-6">Profile Settings</h3>
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        {...registerProfile('firstName', {
                          required: 'First name is required',
                          minLength: {
                            value: 2,
                            message: 'First name must be at least 2 characters'
                          }
                        })}
                        className="input-primary"
                      />
                      {profileErrors.firstName && (
                        <p className="mt-1 text-sm text-accent-error">{profileErrors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        {...registerProfile('lastName', {
                          required: 'Last name is required',
                          minLength: {
                            value: 2,
                            message: 'Last name must be at least 2 characters'
                          }
                        })}
                        className="input-primary"
                      />
                      {profileErrors.lastName && (
                        <p className="mt-1 text-sm text-accent-error">{profileErrors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      {...registerProfile('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                          message: 'Invalid email address'
                        }
                      })}
                      className="input-primary"
                    />
                    {profileErrors.email && (
                      <p className="mt-1 text-sm text-accent-error">{profileErrors.email.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Currency
                      </label>
                      <select
                        {...registerProfile('currency')}
                        className="input-primary"
                      >
                        {currencies.map(currency => (
                          <option key={currency} value={currency}>{currency}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Timezone
                      </label>
                      <select
                        {...registerProfile('timezone')}
                        className="input-primary"
                      >
                        {timezones.map(timezone => (
                          <option key={timezone} value={timezone}>{timezone}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary flex items-center space-x-2"
                    >
                      {isLoading && <div className="loading-spinner"></div>}
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Data Export */}
            {activeTab === 'export' && (
              <DataExport />
            )}

            {/* Account Deletion */}
            {activeTab === 'security' && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-6">Security Settings</h3>
                
                <div className="space-y-6">
                  {/* Change Password Section */}
                  <div className="p-4 border border-border-color rounded-lg">
                    <h4 className="text-md font-medium text-text-primary mb-2">Change Password</h4>
                    <p className="text-text-muted text-sm mb-4">
                      Update your password to keep your account secure.
                    </p>
                    <button className="btn-secondary">
                      Change Password
                    </button>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="p-4 border border-border-color rounded-lg">
                    <h4 className="text-md font-medium text-text-primary mb-2">Two-Factor Authentication</h4>
                    <p className="text-text-muted text-sm mb-4">
                      Add an extra layer of security to your account.
                    </p>
                    <button className="btn-secondary">
                      Enable 2FA
                    </button>
                  </div>

                  {/* Account Deletion */}
                  <div className="p-4 border border-accent-error/20 rounded-lg bg-accent-error/5">
                    <h4 className="text-md font-medium text-accent-error mb-2">Delete Account</h4>
                    <p className="text-text-muted text-sm mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="btn-secondary text-accent-error border-accent-error hover:bg-accent-error hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Other Tabs */}
            {activeTab === 'preferences' && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-6">Preferences</h3>
                <form onSubmit={handlePreferencesSubmit(onPreferencesSubmit)} className="space-y-6">
                  {/* Preferences form remains the same */}
                </form>
              </div>
            )}

            {activeTab === 'billing' && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-6">Billing & Subscription</h3>
                <p className="text-text-muted">Billing and subscription management coming soon...</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary-medium rounded-xl w-full max-w-md"
          >
            <div className="p-6 border-b border-border-color">
              <h3 className="text-lg font-semibold text-accent-error">Delete Account</h3>
            </div>
            
            <div className="p-6">
              <p className="text-text-primary mb-4">
                Are you sure you want to delete your account? This action will:
              </p>
              <ul className="text-text-muted text-sm space-y-2 mb-6">
                <li>• Permanently delete all your transactions</li>
                <li>• Remove all your budgets and goals</li>
                <li>• Delete your personal information</li>
                <li>• This action cannot be undone</li>
              </ul>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 btn-secondary"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="flex-1 bg-accent-error text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isLoading && <div className="loading-spinner"></div>}
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Settings;