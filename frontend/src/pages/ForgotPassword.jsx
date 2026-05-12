import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      toast.success('OTP sent to your email');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email not found');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', {
        email, otp, newPassword
      });
      toast.success('Password reset successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#0a0a0a] items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Back link */}
        <button
          onClick={() => step === 1 ? navigate('/') : setStep(1)}
          className="text-xs text-slate-500 hover:text-slate-300 transition mb-8 flex items-center gap-1"
        >
          ← {step === 1 ? 'Back to login' : 'Back'}
        </button>

        {/* Title */}
        <div className="mb-8">
          <span className="text-xs tracking-[0.3em] uppercase text-slate-500">SEMIS</span>
          <h2 className="text-2xl font-semibold text-white mt-1">
            {step === 1 ? 'Reset your password' : 'Enter new password'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {step === 1
              ? 'Enter your work email and we will send you a verification code.'
              : `We sent a code to ${email}. Enter it below with your new password.`}
          </p>
        </div>

        {/* Step 1 — Email */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Work Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@nexcore.com"
                className="w-full bg-[#1a1a1a] border border-slate-700 rounded-lg px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-white transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-slate-200 disabled:opacity-50 text-black font-medium py-3 rounded-lg text-sm transition"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2 — OTP + New Password */}
        {step === 2 && (
          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1">OTP Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                className="w-full bg-[#1a1a1a] border border-slate-700 rounded-lg px-4 py-3 text-white text-sm text-center tracking-[0.5em] text-lg placeholder-slate-600 focus:outline-none focus:border-white transition"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full bg-[#1a1a1a] border border-slate-700 rounded-lg px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-white transition"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat new password"
                className="w-full bg-[#1a1a1a] border border-slate-700 rounded-lg px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-white transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-slate-200 disabled:opacity-50 text-black font-medium py-3 rounded-lg text-sm transition"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}