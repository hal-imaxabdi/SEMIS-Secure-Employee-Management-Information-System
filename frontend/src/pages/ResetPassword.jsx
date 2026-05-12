import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      await axios.put(
        'http://localhost:5000/api/auth/set-password',
        { password: form.password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Password set! Please log in again.');
      logout();
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set password');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md shadow-sm">
        <div className="mb-6">
          <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center mb-4">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Set your password</h1>
          <p className="text-sm text-gray-400 mt-1">
            This is your first login. Please create a new password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">New Password</label>
            <input
              required
              type="password"
              className={inputClass}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Confirm Password</label>
            <input
              required
              type="password"
              className={inputClass}
              value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })}
              placeholder="Repeat your password"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gray-900 hover:bg-gray-700 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 mt-2"
          >
            {saving ? 'Saving...' : 'Set Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}