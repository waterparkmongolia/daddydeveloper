import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate,
  useLocation
} from 'react-router-dom';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './lib/firebase';
import { getDocFromServer } from 'firebase/firestore';
import { LandingView } from './views/LandingView';
import { OrderView } from './views/OrderView';
import { DashboardView } from './views/DashboardView';
import { AdminView } from './views/AdminView';
import { AuthView } from './views/AuthView';
import { AboutView } from './views/AboutView';
import { Navigation } from './components/Navigation';
import { Intro } from './components/Intro';
import { BusinessView } from './views/BusinessView';
import { AdminMallView } from './views/AdminMallView';
import { MallExperienceView } from './views/MallExperienceView';

interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  role: 'user' | 'admin';
  membership: string;
  initialInvestment?: number;
  recordValue?: number;
  additionalDev?: number;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Connection test
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        let userProfile = docSnap.exists() ? (docSnap.data() as UserProfile) : null;
        
        // Force admin for this specific email
        if (user.email === 'javkhlantai@gmail.com' && userProfile) {
          userProfile = { ...userProfile, role: 'admin', membership: 'Founder' };
        }
        
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    await auth.signOut();
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut: handleSignOut }}>
      <Router>
        <AnimatePresence>
          {showIntro && <Intro onComplete={() => setShowIntro(false)} />}
        </AnimatePresence>
        <div className="flex flex-col h-screen overflow-hidden selection:bg-gray-200">
          <Navigation />
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<LandingView />} />
              <Route path="/about" element={<AboutView />} />
              <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthView />} />
              <Route path="/order" element={user ? <OrderView /> : <Navigate to="/auth" />} />
              <Route path="/dashboard" element={user ? <DashboardView /> : <Navigate to="/auth" />} />
              <Route path="/admin" element={profile?.role === 'admin' ? <AdminView /> : <Navigate to="/" />} />
              <Route path="/business" element={<BusinessView />} />
              <Route path="/mall/admin" element={profile?.role === 'admin' ? <AdminMallView /> : <Navigate to="/" />} />
              <Route path="/mall/:mallId" element={<MallExperienceView />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
