import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../api/auth';

const Register = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
  });

  const onSubmit = async (values) => {
    if (values.password !== values.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await authAPI.register({ name: values.name, email: values.email, password: values.password });
      toast.success('Account created. Please log in.');
      navigate('/login');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-primary-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-primary-medium border border-border-color rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-text-primary mb-6">Create your account</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Full name</label>
            <input
              className="w-full px-3 py-2 rounded-md bg-primary-dark border border-border-color text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              {...register('name', { required: 'Name is required', minLength: 2 })}
              placeholder="Jane Doe"
            />
            {errors.name && <p className="text-accent-error text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded-md bg-primary-dark border border-border-color text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              {...register('email', { required: 'Email is required' })}
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-accent-error text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-md bg-primary-dark border border-border-color text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-accent-error text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Confirm password</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-md bg-primary-dark border border-border-color text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              {...register('confirmPassword', { required: 'Please confirm your password' })}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-accent-error text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 rounded-md bg-accent-primary text-white hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-text-secondary mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-primary hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
