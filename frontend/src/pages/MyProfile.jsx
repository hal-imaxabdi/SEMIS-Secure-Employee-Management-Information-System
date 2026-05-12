import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyProfile() {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ phone: '', address: '' });

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get('http://localhost:5000/api/employee/profile', { headers })
      .then(res => {
        setProfile(res.data);
        setForm({ phone: res.data.phone || '', address: res.data.address || '' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('http://localhost:5000/api/employee/profile', form, { headers });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition";
  const readonlyClass = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 cursor-not-allowed";

  return (
    <Layout>
      <div className="p-8 max-w-2xl">

        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">EMPLOYEE</p>
          <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
        </div>

        {/* Avatar + Name Banner */}
        <div className="bg-[#0a0a0a] rounded-2xl p-6 flex items-center gap-5 mb-8">
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center shrink-0">
            <User size={24} className="text-white" />
          </div>
          <div>
            <p className="text-white text-lg font-semibold">
              {loading ? '...' : `${profile?.firstName} ${profile?.lastName}`}
            </p>
            <p className="text-white/40 text-sm">{profile?.jobTitle} · {profile?.department}</p>
            <p className="text-white/40 text-xs mt-1">{profile?.employeeId}</p>
          </div>
        </div>

        {/* Read-only fields */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Employment Info</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'First Name', value: profile?.firstName },
              { label: 'Last Name', value: profile?.lastName },
              { label: 'Department', value: profile?.department },
              { label: 'Job Title', value: profile?.jobTitle },
              { label: 'Hire Date', value: profile?.hireDate ? new Date(profile.hireDate).toLocaleDateString() : '—' },
              { label: 'Status', value: profile?.status },
            ].map(({ label, value }) => (
              <div key={label}>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">{label}</label>
                <input readOnly className={readonlyClass} value={loading ? '...' : value || '—'} />
              </div>
            ))}
          </div>
        </div>

        {/* Editable fields */}
        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Contact Info <span className="text-indigo-400 normal-case">(editable)</span></p>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Phone</label>
              <input
                className={inputClass}
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. +1 555 000 0000"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Address</label>
              <input
                className={inputClass}
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="e.g. 123 Main St, City"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-5 bg-gray-900 hover:bg-gray-700 text-white text-sm px-5 py-2 rounded-lg transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

      </div>
    </Layout>
  );
}