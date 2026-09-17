import React, { useState, useEffect } from 'react';
import './index.css';
import { getUser, saveUser, getStudents, getTeachers } from './utils/db';
import { SplashScreen, WelcomeScreen, LoginScreen, RegisterScreen } from './screens/AuthScreens';
import { StudentApp } from './screens/StudentApp';
import { TeacherApp } from './screens/TeacherApp';

export default function App() {
  const [phase, setPhase] = useState('splash');
  // splash → welcome → login | register → app
  const [regRole, setRegRole] = useState('student');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = getUser();
    if (saved && saved.id) {
      // Verify stored session against database to prevent spoofing or stale unauthorized logins
      const all = [...getStudents(), ...getTeachers()];
      const verified = all.find(u => u.id === saved.id && u.role === saved.role);
      if (verified && (verified.role !== 'teacher' || verified.approved)) {
        setUser(verified);
        setPhase('app');
      } else {
        saveUser(null);
        setTimeout(() => setPhase('welcome'), 1200);
      }
    } else {
      setTimeout(() => setPhase('welcome'), 2400);
    }
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    setPhase('app');
  };

  const handleLogout = () => {
    saveUser(null);
    setUser(null);
    setPhase('welcome');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {phase === 'splash' && (
        <SplashScreen onDone={() => setPhase('welcome')} />
      )}

      {phase === 'welcome' && (
        <WelcomeScreen
          onLogin={() => setPhase('login')}
          onRegisterStudent={() => { setRegRole('student'); setPhase('register'); }}
          onRegisterTeacher={() => { setRegRole('teacher'); setPhase('register'); }}
        />
      )}

      {phase === 'login' && (
        <LoginScreen
          onBack={() => setPhase('welcome')}
          onSuccess={handleLogin}
        />
      )}

      {phase === 'register' && (
        <RegisterScreen
          initialRole={regRole}
          onBack={() => setPhase('welcome')}
          onSuccess={handleLogin}
        />
      )}

      {phase === 'app' && user && (
        user.role === 'teacher'
          ? <TeacherApp user={user} onLogout={handleLogout} />
          : <StudentApp user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
