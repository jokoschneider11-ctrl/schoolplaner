import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Home from './pages/Home';
import Timetable from './pages/Timetable';
import Grades from './pages/Grades';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';

export default function App() {
  const { isConfigured } = useApp();

  if (!isConfigured) {
    return <Login />;
  }

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
