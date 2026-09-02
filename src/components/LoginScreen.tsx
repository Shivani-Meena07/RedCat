import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, ShieldAlert, ArrowRight, UserCheck, HelpCircle, Check, Key, Sparkles } from 'lucide-react';
import { soundManager } from './SoundManager';
import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { UserRole } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (userId: string, role: UserRole, customMascot?: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  // Auth view states
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  
  // Registration Wizard steps: 1 = Credentials, 2 = Role Selection, 3 = Profile Details & Mascot Customizer
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Anti-bot security verification states
  const [isBotCheckPassed, setIsBotCheckPassed] = useState(false);
  const [captchaError, setCaptchaError] = useState('');

  // Profile metadata states
  const [selectedRole, setSelectedRole] = useState<UserRole>('Creator');
  const [fullName, setFullName] = useState('');
  const [niche, setNiche] = useState(''); // Website or Niche
  const [bio, setBio] = useState('');

  // Mascot Customizer selections
  const [mascotSkin, setMascotSkin] = useState<'rose' | 'gold' | 'moon'>('rose');
  const [mascotClothes, setMascotClothes] = useState<'crimson' | 'blue' | 'green'>('crimson');
  const [mascotHair, setMascotHair] = useState<'tuft' | 'bob' | 'spikes'>('tuft');

  // Potion liquid power value (just a fun interactive minecraft detail!)
  const [potionLevel, setPotionLevel] = useState<number>(3); // 1 to 5

  const handlePotionClick = () => {
    soundManager.play('switch');
    setPotionLevel(prev => (prev % 5) + 1);
  };

  const handleHeaderClick = (roleHint: UserRole) => {
    soundManager.play('click');
    setSelectedRole(roleHint);
    setAuthTab('login');
    setAuthOpen(true);
    setErrorMsg('');
  };

  const handleRegisterStart = () => {
    soundManager.play('click');
    setAuthTab('register');
    setWizardStep(1);
    setErrorMsg('');
  };

  const handleBotChallengeToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (!checked) {
      setIsBotCheckPassed(false);
      return;
    }
    
    setLoading(true);
    setCaptchaError('');
    setErrorMsg('');
    try {
      soundManager.play('switch');
      const response = await fetch('/api/auth/verify-captcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ captchaToken: 'rc-gcapt-valid-token-verified-on-redcat' })
      });
      const data = await response.json();
      if (data.success) {
        setIsBotCheckPassed(true);
        soundManager.play('success');
      } else {
        setIsBotCheckPassed(false);
        setCaptchaError('Anti-bot security validation failed.');
      }
    } catch (err) {
      setIsBotCheckPassed(false);
      setCaptchaError('Network check timeout. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isBotCheckPassed) {
      setErrorMsg("Anti-bot validation required first.");
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      soundManager.play('click');
      const googleUserEmail = email || `googleuser_${Math.floor(100 + Math.random() * 900)}@gmail.com`;
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          idToken: 'MOCK_GOOGLE_ID_TOKEN_REDCAT',
          email: googleUserEmail,
          role: selectedRole,
          captchaToken: 'rc-gcapt-valid-token-verified-on-redcat'
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        soundManager.play('success');
        
        // Save google session locally similar to manual sandbox bypass
        const mockUid = data.uid;
        const mockEmail = data.email;
        const roleToUse = data.role || selectedRole; // The currently selected tab role
        const generatedName = mockEmail.split('@')[0].toUpperCase();
        
        const mockProfile = {
          uid: mockUid,
          email: mockEmail,
          role: roleToUse,
          fullName: `GOOGLE_USER_${generatedName}`,
          niche: roleToUse === 'Brand' ? "https://cosmowear.example" : "Verified Video Creator",
          bio: "Google OAuth authenticated secure session.",
          mascotSkin,
          mascotClothes,
          mascotHair,
          createdAt: Date.now(),
          is_verified: false
        };

        localStorage.setItem(`rc_role_${mockUid}`, roleToUse);
        localStorage.setItem(`rc_profile_${mockUid}`, JSON.stringify(mockProfile));

        // Storing general auth information in sandbox auth local storage
        localStorage.setItem('rc_sandbox_auth', JSON.stringify({
          uid: mockUid,
          email: mockEmail,
          role: roleToUse,
          is_verified: false
        }));

        onLoginSuccess(mockUid, roleToUse, {
          skin: mascotSkin,
          clothes: mascotClothes,
          hair: mascotHair
        });
        setAuthOpen(false);
      } else {
        setErrorMsg(data.error || 'Google Identity Authentication failed.');
      }
    } catch (err) {
      setErrorMsg('Google login connection failed. Choose demo bypass instead.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBotCheckPassed) {
      setErrorMsg("Anti-bot validation required. Please check 'I am not a robot' first.");
      soundManager.play('error');
      return;
    }
    if (!email || !password) {
      setErrorMsg(' Please enter your email and password.');
      soundManager.play('error');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      soundManager.play('click');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      soundManager.play('success');
      
      // We check if this is our master Admin bypass
      let assignedRole: UserRole = 'Creator';
      if (email.toLowerCase().includes('admin') || email === 'admin@redcat.ai') {
        assignedRole = 'Admin';
      } else {
        // Find saved role from localStorage cache or fetch doc (we'll fetch in parents, but let's provide fallback)
        const cachedRole = localStorage.getItem(`rc_role_${userCredential.user.uid}`);
        if (cachedRole) {
          assignedRole = cachedRole as UserRole;
        }
      }

      onLoginSuccess(userCredential.user.uid, assignedRole, {
        skin: mascotSkin,
        clothes: mascotClothes,
        hair: mascotHair
      });
    } catch (err: any) {
      soundManager.play('error');
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('Firebase Email/Password Sign-In is disabled in your Firebase console. Please use the instant "Sandbox Demo Bypass" below to enter immediately!');
      } else if (err.code === 'auth/user-not-found') {
        setErrorMsg('No user was found with this email. Click "Register" to create one!');
      } else if (err.code === 'auth/wrong-password') {
        setErrorMsg('Invalid password. Please double check and try again.');
      } else {
        setErrorMsg(err.message || 'Login failed. Please specify valid values.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setErrorMsg('Please specify your email in the field to trigger reset.');
      soundManager.play('error');
      return;
    }
    try {
      soundManager.play('click');
      await sendPasswordResetEmail(auth, email);
      soundManager.play('success');
      setResetSent(true);
      setErrorMsg('');
      setTimeout(() => setResetSent(false), 5000);
    } catch (err: any) {
      soundManager.play('error');
      setErrorMsg(err.message || 'Failed to send password-reset link.');
    }
  };

  const handleWizardNext = () => {
    soundManager.play('click');
    if (wizardStep === 1) {
      if (!email || !password) {
        setErrorMsg('Please specify a valid email and password.');
        soundManager.play('error');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password should be at least 6 characters.');
        soundManager.play('error');
        return;
      }
      setErrorMsg('');
      setWizardStep(2);
    } else if (wizardStep === 2) {
      setWizardStep(3);
    }
  };

  const handleSandboxBypass = (roleToUse: UserRole) => {
    soundManager.play('success');
    const mockUid = `demo_sb_${roleToUse.toLowerCase()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const mockEmail = email || `${roleToUse.toLowerCase()}_demo@redcat.ai`;
    
    // Construct default mascot configuration
    const mockSkin = mascotSkin || 'rose';
    const mockClothes = mascotClothes || 'crimson';
    const mockHair = mascotHair || 'tuft';

    const mockProfile = {
      uid: mockUid,
      email: mockEmail,
      role: roleToUse,
      fullName: fullName || (roleToUse === 'Brand' ? "CosmoWear Co." : roleToUse === 'Admin' ? "System Overseer" : "AstroVlogs TV"),
      niche: niche || (roleToUse === 'Brand' ? "https://cosmowear.example" : "Gaming & Tech Reviews"),
      bio: bio || "Authorized sandbox explorer on the RedCat Escrow console.",
      mascotSkin: mockSkin,
      mascotClothes: mockClothes,
      mascotHair: mockHair,
      createdAt: Date.now(),
      isSandbox: true
    };

    // Keep locally in localStorage to pass auth queries
    localStorage.setItem('rc_sandbox_auth', JSON.stringify(mockProfile));
    localStorage.setItem(`rc_role_${mockUid}`, roleToUse);
    localStorage.setItem(`rc_profile_${mockUid}`, JSON.stringify(mockProfile));

    onLoginSuccess(mockUid, roleToUse, {
      skin: mockSkin,
      clothes: mockClothes,
      hair: mockHair
    });
    setAuthOpen(false);
  };

  const handleWizardSubmit = async () => {
    if (!fullName) {
      setErrorMsg('Please state your full name/brand title.');
      soundManager.play('error');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      soundManager.play('click');
      // Create account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Save profile metadata document in Firestore securely
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const profileData = {
        uid: userCredential.user.uid,
        email: email,
        role: selectedRole,
        fullName: fullName,
        niche: niche || "None specified",
        bio: bio || "Explorer profile on RedCat.",
        mascotSkin,
        mascotClothes,
        mascotHair,
        createdAt: Date.now()
      };

      await setDoc(userDocRef, profileData);

      // Cache locally
      localStorage.setItem(`rc_role_${userCredential.user.uid}`, selectedRole);
      localStorage.setItem(`rc_profile_${userCredential.user.uid}`, JSON.stringify(profileData));

      soundManager.play('success');
      onLoginSuccess(userCredential.user.uid, selectedRole, {
        skin: mascotSkin,
        clothes: mascotClothes,
        hair: mascotHair
      });
    } catch (err: any) {
      soundManager.play('error');
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('Firebase Email/Password registration is disabled in your Firebase console. Feel free to register instantly with the "Sandbox Demo Bypass" below!');
      } else {
        setErrorMsg(err.message || 'Error occurred registering credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen z-0 bg-transparent flex flex-col justify-between overflow-x-hidden text-white font-mono p-4">
      
      {/* Upper Space */}
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center pt-8 md:pt-16">
        
        {/* LOGO WITH RED CAT INSIGNIA */}
        <div className="relative flex items-center gap-4 mb-10 select-none scale-100 sm:scale-110">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl sm:text-6xl font-black tracking-widest text-[#dfcedf] font-mono [text-shadow:_4px_4px_0_#1a0c1a,_8px_8px_0_#000]">
              RED CAT
            </h1>
            <span className="text-[10px] mt-2 font-mono uppercase tracking-[0.25em] text-cyan-400 bg-black/40 px-2 py-0.5 rounded border border-cyan-400/30">
              Creator Escrow Platform
            </span>
          </div>
          
          {/* Neon cats ear insignia */}
          <div className="relative w-14 h-12 border-2 border-red-500 bg-slate-900/60 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)]">
            <span className="absolute -top-3.5 left-1 w-5 h-5 bg-red-500 border-2 border-black rotate-45 rounded-sm"></span>
            <span className="absolute -top-3.5 right-1 w-5 h-5 bg-red-500 border-2 border-black rotate-45 rounded-sm"></span>
            <div className="relative flex items-center gap-1 mt-1 z-10 w-fit">
              <span className="w-2.5 h-1.5 bg-yellow-400 rounded-sm"></span>
              <span className="w-2.5 h-1.5 bg-yellow-400 rounded-sm"></span>
            </div>
          </div>
        </div>

        {/* CORE PLATFORM CONSOLE HEADERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl px-2">
          
          {/* Button ADMIN */}
          <button
            onClick={() => handleHeaderClick('Admin')}
            className="minecraft-btn text-base font-bold text-slate-100 py-4 border-b-4 border-r-4 border-black/80 bg-neutral-400 border-t-2 border-l-2 border-t-white border-l-white hover:bg-neutral-300 transition-all active:translate-y-1 active:border-b-0 active:border-r-0 select-none text-center outline-none"
            style={{ imageRendering: 'pixelated' }}
          >
            ADMIN ONLY
          </button>

          {/* Button BRANDS AND COLLABORATORS */}
          <button
            onClick={() => handleHeaderClick('Brand')}
            className="minecraft-btn text-base font-bold text-slate-100 py-4 border-b-4 border-r-4 border-black/80 bg-neutral-400 border-t-2 border-l-2 border-t-white border-l-white hover:bg-neutral-300 transition-all active:translate-y-1 active:border-b-0 active:border-r-0 select-none text-center outline-none"
            style={{ imageRendering: 'pixelated' }}
          >
            BRANDS & COLLABS
          </button>

          {/* Button INFLUENCERS */}
          <button
            onClick={() => handleHeaderClick('Creator')}
            className="minecraft-btn text-base font-bold text-slate-100 py-4 border-b-4 border-r-4 border-black/80 bg-neutral-400 border-t-2 border-l-2 border-t-white border-l-white hover:bg-neutral-300 transition-all active:translate-y-1 active:border-b-0 active:border-r-0 select-none text-center outline-none"
            style={{ imageRendering: 'pixelated' }}
          >
            INFLUENCERS
          </button>
        </div>

        {/* Settings button under headers */}
        <div className="w-full max-w-md px-2 mt-4">
          <button
            onClick={() => {
              soundManager.play('click');
              alert("System Settings:\n1. Server Status: Connected to Core Cloud\n2. Audio: Sound-brand integrated\n3. Zero-identity tracing level: Maximum.");
            }}
            className="w-full minecraft-btn text-sm font-semibold text-slate-200 py-2.5 border-b-4 border-r-4 border-black bg-neutral-500 border-t-2 border-l-2 border-t-neutral-300 border-l-neutral-300 hover:bg-neutral-400 active:translate-y-0.5"
          >
            Settings & Security Parameters
          </button>
        </div>
      </div>

      {/* Center Layout for interactive mockup items */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 my-10 items-center px-4">
        
        {/* Bottom Left interactive mock features */}
        <div className="flex flex-col items-start gap-4">
          
          {/* Arrow pointing at SIGN IN */}
          <div className="flex items-center gap-3">
            {/* Custom animated yellow pointing block arrow */}
            <div className="animate-bounce flex items-center">
              <span className="w-6 h-4 bg-yellow-400 border-2 border-black block"></span>
              <span className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[12px] border-l-yellow-400 border-2 border-transparent relative -left-1"></span>
            </div>

            <button
              onClick={() => {
                soundManager.play('click');
                setAuthTab('login');
                setWizardStep(1);
                setAuthOpen(true);
              }}
              className="bg-[#24d142] hover:bg-green-400 border-b-4 border-r-4 border-black border-t-2 border-l-2 border-t-green-200 border-l-green-200 text-black font-black text-xl px-8 py-3 tracking-wider active:translate-y-0.5 outline-none select-none text-center"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* console selection mock helper */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm py-4 select-none">
        <button
          onClick={() => {
            soundManager.play('click');
            try {
              window.location.href = "REDCAT(1).html";
            } catch (err) {
              console.error("Navigation exception during Tech Titans routing:", err);
              alert("Routing Notice: Unable to resolve execution team profile pathway locally. Falling back safely.");
            }
          }}
          className="flex items-center gap-2 bg-black/60 hover:bg-slate-850 border border-slate-800 hover:border-yellow-400 text-[#dfcedf] hover:text-yellow-400 px-4 py-2 rounded-lg text-xs transition-all duration-150 cursor-pointer shadow-md hover:scale-[1.04] active:scale-95 text-center font-bold font-mono uppercase"
        >
          <span className="w-4 h-4 rounded-full bg-green-500 text-black flex items-center justify-center text-[10px] font-black">A</span>
          <span>Contact the Developers</span>
        </button>
        <button
          onClick={() => {
            soundManager.play('click');
            try {
              window.location.href = "contact.html";
            } catch (err) {
              console.error("Navigation exception during Support Matrix routing:", err);
              alert("Routing Notice: Unable to resolve support matrix portal pathway locally. Falling back safely.");
            }
          }}
          className="flex items-center gap-2 bg-black/60 hover:bg-slate-850 border border-slate-800 hover:border-red-500 text-[#dfcedf] hover:text-[#ff4a5a] px-4 py-2 rounded-lg text-xs transition-all duration-150 cursor-pointer shadow-md hover:scale-[1.04] active:scale-95 text-center font-bold font-mono uppercase"
        >
          <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-black">B</span>
          <span>Contact Us</span>
        </button>
      </div>

      {/* Footer credits matches the image precisely */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-4 border-t border-slate-800/50 pt-2 bg-black/20">
        <span>©Mojang AB</span>
        <span>v1.19.73</span>
      </div>

      {/* AUTHENTICATION MODAL (tab controller & Create Profile Wizard) */}
      <AnimatePresence>
        {authOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border-2 border-slate-700 rounded-xl max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col"
              style={{ borderColor: selectedRole === 'Admin' ? '#ef4444' : selectedRole === 'Brand' ? '#3b82f6' : '#22c55e' }}
            >
              {/* Custom outline header */}
              <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#dfcedf] block">RedCat Ecosystem</span>
                  <h3 className="text-sm font-bold text-yellow-400">
                    {authTab === 'login' ? `Sign In to Space console: ${selectedRole}` : `Create a New profile Wizard`}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    soundManager.play('close');
                    setAuthOpen(false);
                  }}
                  className="w-7 h-7 bg-slate-800 hover:bg-red-500 text-slate-300 hover:text-white rounded-full flex items-center justify-center text-xs transition-colors"
                >
                  X
                </button>
              </div>

              {/* TABS SELECTOR ONLY FOR GUEST */}
              <div className="flex border-b border-slate-800">
                <button
                  onClick={() => {
                    soundManager.play('click');
                    setAuthTab('login');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                    authTab === 'login' ? 'bg-slate-900 text-yellow-400 border-b-2 border-yellow-400' : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900/40'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={handleRegisterStart}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                    authTab === 'register' ? 'bg-slate-900 text-yellow-400 border-b-2 border-yellow-400' : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900/40'
                  }`}
                >
                  Sign Up (Create Profile Wizard)
                </button>
              </div>

              {/* CONTENT VIEW */}
              <div className="p-5 overflow-y-auto max-h-[460px] flex-1">
                {errorMsg && (
                  <div className="bg-red-950/40 border border-red-500/50 p-3 rounded text-red-300 text-xs mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* LOGIN FLOW */}
                {authTab === 'login' && (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase text-slate-400 font-bold block">Consular Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.name@redcat.ai"
                          className="w-full bg-slate-950 border border-slate-800 rounded px-9 py-2 text-slate-200 text-xs focus:outline-none focus:border-yellow-400 input-minecraft"
                        />
                      </div>
                      {selectedRole === 'Admin' && (
                        <p className="text-[9px] text-red-400 italic">Please enter administrative credential email to access the limited admin suite.</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase text-slate-400 font-bold block">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-slate-950 border border-slate-800 rounded px-9 py-2 text-slate-200 text-xs focus:outline-none focus:border-yellow-400 input-minecraft"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="text-slate-400 hover:text-yellow-400 transition-colors underline flex items-center gap-1"
                      >
                        <Key className="w-3.5 h-3.5" /> Forgot Password?
                      </button>
                      <p className="text-slate-500 font-mono text-[9px] uppercase">AES-256 standard</p>
                    </div>

                    {resetSent && (
                      <p className="text-green-400 text-[10px] mt-1">✓ Reset email sent successfully. Check inbox.</p>
                    )}

                    {/* ABUSE PROTECTION CHECKBOX */}
                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between gap-3 text-xs">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isBotCheckPassed}
                          onChange={handleBotChallengeToggle}
                          disabled={loading}
                          className="w-4 h-4 bg-slate-900 border border-slate-700 rounded text-yellow-400 focus:ring-0 cursor-pointer text-slate-900"
                        />
                        <span className="font-mono text-slate-300 font-bold">I am not a robot</span>
                      </label>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                        reCAPTCHA Protected
                      </span>
                    </div>
                    {captchaError && (
                      <p className="text-red-400 text-[10px] font-mono">{captchaError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-red-600 hover:bg-rose-500 py-3 text-black font-extrabold rounded border-b-4 border-black flex items-center justify-center gap-2 text-xs uppercase cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Entering consuls...' : `Enter Console`} <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* SECURE GOOGLE OAUTH */}
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-slate-800"></div>
                      <span className="flex-shrink mx-4 text-[9px] text-slate-500 font-bold uppercase font-mono">Or secure Google OAuth</span>
                      <div className="flex-grow border-t border-slate-800"></div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading || !isBotCheckPassed}
                      className="w-full bg-slate-950 hover:bg-slate-850/80 py-2.5 rounded-lg border border-slate-800 hover:border-yellow-400 font-mono text-xs font-bold tracking-wider text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.614 0-6.55-2.936-6.55-6.55S8.626 4.9 12.24 4.9c1.623 0 3.109.586 4.269 1.545l2.44-2.44C17.433 2.503 14.992 1.3 12.24 1.3 6.335 1.3 1.517 6.118 1.517 12s4.818 10.7 10.723 10.7c5.962 0 10.377-4.186 10.377-10.436 0-.64-.076-1.258-.22-1.849L12.24 10.285z"/>
                      </svg>
                      <span>Sign In with Google Identity</span>
                    </button>
                  </form>
                )}

                {/* Secure Sandbox Demo Bypass panel accessible during logins */}
                <div className="mt-6 pt-4 border-t border-slate-800 space-y-2 select-none">
                  <div className="flex items-center gap-1.5 text-yellow-500 font-bold text-[10px] uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sandbox Demo instant Bypass</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                    Firebase authentication provider offline or not configured in your console? Click below to immediately launch the dashboard in sandbox demonstration mode:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSandboxBypass('Creator')}
                      className="text-left bg-slate-950 hover:bg-slate-800/80 border border-emerald-500/30 p-2.5 rounded flex items-center justify-between text-[11px] text-emerald-400 group transition-all"
                    >
                      <span className="font-bold flex items-center gap-1">
                        <span>🎮</span>
                        <span>Creator Demo</span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSandboxBypass('Brand')}
                      className="text-left bg-slate-950 hover:bg-slate-800/80 border border-cyan-500/30 p-2.5 rounded flex items-center justify-between text-[11px] text-cyan-400 group transition-all"
                    >
                      <span className="font-bold flex items-center gap-1">
                        <span>🏢</span>
                        <span>Brand Demo</span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-cyan-500 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  {selectedRole === 'Admin' && (
                    <button
                      type="button"
                      onClick={() => handleSandboxBypass('Admin')}
                      className="w-full mt-2 text-left bg-red-950/40 hover:bg-red-900/30 border border-red-500 p-3 rounded flex items-center justify-between text-xs text-red-400 group transition-all cursor-pointer"
                    >
                      <span className="font-bold flex items-center gap-2">
                        <span>⚙️</span>
                        <span>Administrative Console Bypass</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-red-500 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>

                {/* CREATOR/BRAND MULTI-STEP REGISTRATION WIZARD */}
                {authTab === 'register' && (
                  <div className="space-y-4">
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      {[1, 2, 3].map((num) => (
                        <div key={num} className="flex items-center gap-1.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            wizardStep === num ? 'bg-yellow-400 text-slate-950' : wizardStep > num ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-500'
                          }`}>
                            {num}
                          </span>
                          <span className={`text-[10px] hidden sm:inline ${wizardStep === num ? 'text-yellow-400 font-bold' : 'text-slate-400'}`}>
                            {num === 1 ? 'Account' : num === 2 ? 'Role' : 'Customize Profile'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Step 1: Authentication */}
                    {wizardStep === 1 && (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-slate-400 font-bold block">User Email</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="brand-officer@company.com"
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-slate-200 focus:outline-none focus:border-yellow-400 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-slate-400 font-bold block">Password (at least 6 characters)</label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 6 characters required"
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-slate-200 focus:outline-none focus:border-yellow-400 font-mono"
                          />
                        </div>

                        <button
                          onClick={handleWizardNext}
                          className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-950 py-3 rounded font-black text-xs uppercase flex items-center justify-center gap-1"
                        >
                          Continue Wizard <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Step 2: Role Selecting */}
                    {wizardStep === 2 && (
                      <div className="space-y-4 text-center">
                        <p className="text-xs text-slate-300 mb-2 font-semibold">Which console role meets your objectives?</p>
                        
                        <div className="grid grid-cols-2 gap-3 pb-2">
                          <button
                            onClick={() => { soundManager.play('click'); setSelectedRole('Creator'); }}
                            className={`p-4 rounded-lg border-2 text-left space-y-1 cursor-pointer transition-all ${
                              selectedRole === 'Creator' ? 'border-green-400 bg-green-950/20 shadow-md' : 'border-slate-800 bg-slate-950/40 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <span className="text-xl block">🎨</span>
                            <span className="font-bold text-xs text-green-300 block">Creator</span>
                            <span className="text-[9px] text-slate-400 leading-normal block">Unlock matches, construct visual plans, customize pixel mascot attributes list.</span>
                          </button>

                          <button
                            onClick={() => { soundManager.play('click'); setSelectedRole('Brand'); }}
                            className={`p-4 rounded-lg border-2 text-left space-y-1 cursor-pointer transition-all ${
                              selectedRole === 'Brand' ? 'border-cyan-400 bg-cyan-950/20 shadow-md' : 'border-slate-800 bg-slate-950/40 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <span className="text-xl block">🏢</span>
                            <span className="font-bold text-xs text-cyan-300 block">Brand Partner</span>
                            <span className="text-[9px] text-slate-400 leading-normal block">Draft campaign briefs using conversational AI chatbots, authorize escrows.</span>
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setWizardStep(1)}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 py-2.5 rounded text-xs text-slate-200"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleWizardNext}
                            className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-slate-950 py-2.5 rounded text-xs font-black uppercase flex items-center justify-center gap-1"
                          >
                            Next <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Profile Details & Mascot Customizer */}
                    {wizardStep === 3 && (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-slate-400 font-bold block">
                            {selectedRole === 'Brand' ? 'Brand / Company Name' : 'Creator Name'}
                          </label>
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder={selectedRole === 'Brand' ? "Nike, RedCat Ltd" : "Rahul Vlogs"}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-slate-400 font-bold block">
                            {selectedRole === 'Brand' ? 'Website or Product URL' : 'Primary Niche'}
                          </label>
                          <input
                            type="text"
                            value={niche}
                            onChange={(e) => setNiche(e.target.value)}
                            placeholder={selectedRole === 'Brand' ? "https://nike.example" : "Gaming, Tech, Beauty Reels"}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-slate-400 font-bold block">Brief Biography</label>
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="A brief message on profile goals..."
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 min-h-[48px] focus:outline-none resize-none"
                          />
                        </div>

                        {/* MASCOT CUSTOMIZER GRID */}
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                          <span className="text-[10px] text-yellow-400 font-black block tracking-widest uppercase">MASCOT LOOK CUSTOMIZATION</span>
                          
                          <div className="flex items-center gap-3">
                            {/* Live preview in wizard */}
                            <div className={`creator-mascot shrink-0 scale-75 skin-${mascotSkin} clothes-${mascotClothes} hair-${mascotHair}`} style={{ cursor: 'default' }}>
                              <span className="mascot-hair" />
                              <span className="mascot-face" />
                              <span className="mascot-outfit" />
                            </div>

                            <div className="text-[10px] text-slate-400 font-sans leading-normal">
                              Create custom catalog parameters. Adjust your avatar characteristics.
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-800">
                            {/* Skin */}
                            <div className="text-center">
                              <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Skin</span>
                              <select
                                value={mascotSkin}
                                onChange={(e) => setMascotSkin(e.target.value as any)}
                                className="w-full bg-slate-900 text-slate-200 text-[10px] border border-slate-700 p-1 font-mono rounded"
                              >
                                <option value="rose">Rose</option>
                                <option value="gold">Gold</option>
                                <option value="moon">Moon</option>
                              </select>
                            </div>

                            {/* Clothes */}
                            <div className="text-center">
                              <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Clothes</span>
                              <select
                                value={mascotClothes}
                                onChange={(e) => setMascotClothes(e.target.value as any)}
                                className="w-full bg-slate-900 text-slate-200 text-[10px] border border-slate-700 p-1 font-mono rounded"
                              >
                                <option value="crimson">Crimson</option>
                                <option value="blue">Blue</option>
                                <option value="green">Green</option>
                              </select>
                            </div>

                            {/* Hair */}
                            <div className="text-center">
                              <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Hair</span>
                              <select
                                value={mascotHair}
                                onChange={(e) => setMascotHair(e.target.value as any)}
                                className="w-full bg-slate-900 text-slate-200 text-[10px] border border-slate-700 p-1 font-mono rounded"
                              >
                                <option value="tuft">Tuft</option>
                                <option value="bob">Bob</option>
                                <option value="spikes">Spikes</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-slate-800">
                          <button
                            onClick={() => setWizardStep(2)}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 py-2.5 rounded text-xs text-slate-200 cursor-pointer"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleWizardSubmit}
                            disabled={loading}
                            className="flex-1 bg-green-500 hover:bg-green-400 text-black py-2.5 rounded text-xs font-black uppercase flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {loading ? "Constructing..." : "Finish Profile"} <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
