import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { UserRole } from './types';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import NotificationBar from './components/NotificationBar';
import { soundManager } from './components/SoundManager';
import { ShieldCheck, ShieldAlert, BadgeInfo } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [mascotData, setMascotData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lazy resume SoundContext on user interactions
    const initSound = () => {
      soundManager.resume();
    };
    window.addEventListener('click', initSound, { once: true });
    window.addEventListener('keydown', initSound, { once: true });
    return () => {
      window.removeEventListener('click', initSound);
      window.removeEventListener('keydown', initSound);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        setUserEmail(currentUser.email || '');

        try {
          // Check cache first for instant UI response time
          const cachedRole = localStorage.getItem(`rc_role_${currentUser.uid}`);
          if (cachedRole) {
            setUserRole(cachedRole as UserRole);
          }

          // Read real-time document profile saved from Create Profile Wizard in Firestore
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserRole(data.role as UserRole);
            setMascotData({
              skin: data.mascotSkin,
              clothes: data.mascotClothes,
              hair: data.mascotHair
            });
            // Update cache
            localStorage.setItem(`rc_role_${currentUser.uid}`, data.role);
            localStorage.setItem(`rc_profile_${currentUser.uid}`, JSON.stringify(data));
          } else {
            // Fallback for Master Administrative logins default trigger
            if (currentUser.email?.toLowerCase().includes('admin') || currentUser.email === 'admin@redcat.ai') {
              setUserRole('Admin');
              localStorage.setItem(`rc_role_${currentUser.uid}`, 'Admin');
            } else {
              // General Creator fallback matching Sign Up values
              setUserRole('Creator');
              localStorage.setItem(`rc_role_${currentUser.uid}`, 'Creator');
            }
          }
        } catch (error) {
          console.warn("Firestore connectivity warning. Falling back to cached state indicators:", error);
          // Safe robust checkout
          const cachedRole = (localStorage.getItem(`rc_role_${currentUser.uid}`) as UserRole) || 'Creator';
          setUserRole(cachedRole);
        }
      } else {
        // Fallback check to see if we have a sandbox custom bypass auth
        const sandboxUserStr = localStorage.getItem('rc_sandbox_auth');
        if (sandboxUserStr) {
          try {
            const sUser = JSON.parse(sandboxUserStr);
            setUser({
              uid: sUser.uid,
              email: sUser.email,
              isSandbox: true
            });
            setUserEmail(sUser.email);
            setUserRole(sUser.role as UserRole);
            setMascotData({
              skin: sUser.mascotSkin || 'rose',
              clothes: sUser.mascotClothes || 'crimson',
              hair: sUser.mascotHair || 'tuft'
            });
          } catch (e) {
            setUser(null);
            setUserRole(null);
            setUserEmail('');
            setMascotData(null);
          }
        } else {
          setUser(null);
          setUserRole(null);
          setUserEmail('');
          setMascotData(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleLoginSuccess = (uid: string, assignedRole: UserRole, mascot?: any) => {
    soundManager.play('success');
    
    // Check if it's a sandbox login
    const sandboxUserStr = localStorage.getItem('rc_sandbox_auth');
    if (sandboxUserStr) {
      try {
        const sUser = JSON.parse(sandboxUserStr);
        if (sUser.uid === uid) {
          setUser({
            uid: sUser.uid,
            email: sUser.email,
            isSandbox: true
          });
          setUserEmail(sUser.email);
          setUserRole(assignedRole);
          if (mascot) {
            setMascotData(mascot);
          }
          return;
        }
      } catch (err) {
        console.warn(err);
      }
    }
    
    setUserRole(assignedRole);
    if (mascot) {
      setMascotData(mascot);
    }
  };

  const handleLogout = async () => {
    soundManager.play('close');
    localStorage.removeItem('rc_sandbox_auth');
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Sign out error:", e);
    }
    setUser(null);
    setUserRole(null);
    setUserEmail('');
    setMascotData(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-mono p-4">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-12 h-12 border-2 border-red-500 rounded-full animate-ping absolute opacity-70" />
          <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse" />
        </div>
        <p className="text-xs tracking-[0.2em] uppercase text-slate-400">Loading RedCat Consoles ...</p>
      </div>
    );
  }

  return (
    <div className="App min-h-screen bg-transparent flex flex-col relative overflow-hidden">
      {/* Dynamic retro-pixelated cosmic workspace scene requested by user */}
      <div className="pixel-sky">
        <div className="sky-star s1"></div>
        <div className="sky-star s2"></div>
        <div className="sky-star s3"></div>
        <div className="pixel-sun"></div>
        <div className="pixel-moon"></div>
        <div className="pixel-cloud c1"></div>
        <div className="pixel-cloud c2"></div>
        <div className="mountain m1"></div>
        <div className="mountain m2"></div>
        <div className="mountain m3"></div>
        <div className="block-ground"></div>
      </div>

      {/* Live top event notifications bar */}
      <NotificationBar />

      {!user || !userRole ? (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Dashboard
          userId={user.uid}
          userRole={userRole}
          userEmail={userEmail}
          initialMascot={mascotData}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
