import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Save, User, Bell, Shield, Palette, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';
import Toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

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
      const response = await authAPI.updateDetails(data);
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
      const response = await authAPI.updateDetails({ preferences: data });
      updateUser(response.data.data.user);
      Toast.success('Preferences updated successfully');
    } catch (error) {
      Toast.error(error.response?.data?.message || 'Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
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

            {/* Preferences Settings */}
            {activeTab === 'preferences' && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-6">Preferences</h3>
                <form onSubmit={handlePreferencesSubmit(onPreferencesSubmit)} className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-text-primary mb-4">Appearance</h4>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border-color">
                      <div>
                        <p className="text-text-primary font-medium">Dark Mode</p>
                        <p className="text-text-muted text-sm">Use dark theme throughout the app</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          {...registerPreferences('darkMode')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-primary-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-text-primary mb-4">Notifications</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border border-border-color">
                        <div>
                          <p className="text-text-primary font-medium">Email Notifications</p>
                          <p className="text-text-muted text-sm">Receive updates via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            {...registerPreferences('notifications.email')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-primary-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border border-border-color">
                        <div>
                          <p className="text-text-primary font-medium">Push Notifications</p>
                          <p className="text-text-muted text-sm">Receive browser notifications</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            {...registerPreferences('notifications.push')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-primary-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border border-border-color">
                        <div>
                          <p className="text-text-primary font-medium">Budget Alerts</p>
                          <p className="text-text-muted text-sm">Get notified when approaching budget limits</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            {...registerPreferences('notifications.budgetAlerts')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-primary-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
                        </label>
                      </div>
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
                      <span>Save Preferences</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Other Tabs Placeholder */}
            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-6">Notification Settings</h3>
                <p className="text-text-muted">Advanced notification settings coming soon...</p>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-6">Security Settings</h3>
                <p className="text-text-muted">Security settings and two-factor authentication coming soon...</p>
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
    </div>
  );
};

export default Settings;