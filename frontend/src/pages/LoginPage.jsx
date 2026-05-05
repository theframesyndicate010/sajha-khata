import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Terminal, ShieldCheck, ArrowRight, User, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { login } from "../utils/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      setError(error?.message || "Login failed. Please try again.");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-inter">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-[32px] overflow-hidden shadow-2xl relative z-10 border border-white/10">
        {/* Left Side - Brand Branding */}
        <div className="bg-blue-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 opacity-50"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-8 border border-white/20">
              <Terminal size={28} />
            </div>
            <h1 className="text-4xl font-black tracking-tight leading-tight">
              Software<br />Khata v2.0
            </h1>
            <p className="mt-4 text-blue-100 font-medium">
              The ultimate financial operating system for engineering teams and digital agencies.
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-white/20 p-1.5 rounded-lg">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Security First Approach</h4>
                <p className="text-xs text-blue-100">Only authorized administrators can access the ledger records.</p>
              </div>
            </div>
            
            <div className="pt-8 border-t border-white/10">
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">
                Trusted by 40+ Engineering Teams
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="p-12 bg-white flex flex-col justify-center">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-900">Admin Login</h2>
            <p className="text-slate-500 text-sm mt-2">Enter your credentials to access the terminal</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Email Address</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@khata.com"
                  className="w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:outline-none transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:outline-none transition-all font-medium text-slate-900"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700">Remember session</span>
              </label>
              <button type="button" className="text-xs font-bold text-blue-600 hover:underline">Forgot Password?</button>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl ${
                isLoggingIn
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20 active:scale-[0.98]"
              }`}
            >
              {isLoggingIn ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying Identity...
                </div>
              ) : (
                <>
                  Access Terminal <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Restricted Area. Authorized Access Only.
            </p>
          </div>
        </div>
      </div>

      <p className="fixed bottom-8 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
        &copy; 2024 Software Khata Inc. &bull; Version 2.0.4-beta
      </p>
    </div>
  );
}
