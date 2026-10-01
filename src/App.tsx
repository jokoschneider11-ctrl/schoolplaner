import { Routes, Route, Navigate } from 'react-router-dom';
<<<<<<< HEAD
=======
import { useApp } from './context/AppContext';
import Login from './pages/Login';
>>>>>>> f7a41313dc415e6f01cf2d737457bd4412f0d8bc
import Layout from './components/Layout';
import Home from './pages/Home';
import Timetable from './pages/Timetable';
import Grades from './pages/Grades';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';

export default function App() {
<<<<<<< HEAD
=======
  const { isConfigured } = useApp();

  if (!isConfigured) {
    return <Login />;
  }

>>>>>>> f7a41313dc415e6f01cf2d737457bd4412f0d8bc
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/grades" element={<Grades />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
