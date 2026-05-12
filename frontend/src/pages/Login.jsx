import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/login', { email, password });
      toast.success('OTP sent to your email');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
      const { token, role, mustResetPassword } = res.data;

      login(token, role, mustResetPassword);
      toast.success('Welcome back');

      // First login — force password reset before entering the system
      if (mustResetPassword) {
        navigate('/reset-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">

      {/* Left — background image */}
      <div className="hidden lg:flex w-1/2 relative">
        <img
          src="/src/assets/office-bg.png"
          alt="Office"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <p className="text-xs tracking-[0.3em] uppercase text-slate-300 mb-2">NexCore Technologies</p>
          <h1 className="text-4xl font-bold leading-tight">Secure Employee<br />Management System</h1>
          <p className="text-slate-400 mt-3 text-sm">Internal HR Platform · Confidential</p>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex w-full lg:w-1/2 bg-[#0a0a0a] items-center justify-center px-8">
        <div className="w-full max-w-sm">

          {/* Title */}
          <div className="mb-10">
            <span className="text-xs tracking-[0.3em] uppercase text-slate-500">SEMIS</span>
            <h2 className="text-2xl font-semibold text-white mt-1">
              {step === 1 ? 'Sign in to your account' : 'Enter verification code'}
            </h2>
            {step === 2 && (
              <p className="text-slate-400 text-sm mt-1">
                We sent a 6-digit code to <span className="text-slate-200">{email}</span>
              </p>
            )}
          </div>

          {/* Step 1 — Email + Password */}
          {step === 1 && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@nexcore.com"
                  className="w-full bg-[#1a1a1a] border border-slate-700 rounded-lg px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-white transition"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1a1a1a] border border-slate-700 rounded-lg px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-white transition"
                />
              </div>
              <div className="text-right">
                <a href="/forgot-password" className="text-xs text-slate-500 hover:text-slate-300 transition">
                  Forgot password?
                </a>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white hover:bg-slate-200 disabled:opacity-50 text-black font-medium py-3 rounded-lg text-sm transition"
              >
                {loading ? 'Sending OTP...' : 'Continue'}
              </button>
            </form>
          )}

          {/* Step 2 — OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
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
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white hover:bg-slate-200 disabled:opacity-50 text-black font-medium py-3 rounded-lg text-sm transition"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-slate-500 hover:text-slate-300 text-sm transition"
              >
                ← Back
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}