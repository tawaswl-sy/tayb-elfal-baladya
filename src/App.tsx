import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Machinery from './pages/Machinery';
import MachineryDetails from './pages/MachineryDetails';
import EmployeeDetails from './pages/EmployeeDetails';
import Documents from './pages/Documents';
import Projects from './pages/Projects';
import Complaints from './pages/Complaints';
import Licenses from './pages/Licenses';
import Activity from './pages/Activity';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Backups from './pages/Backups';
import Developer from './pages/Developer';
import Tasks from './pages/Tasks';
import Decisions from './pages/Decisions';
import Budget from './pages/Budget';
import Meetings from './pages/Meetings';
import MorningReport from './pages/MorningReport';
import DataBank from './pages/databank/DataBank';
import Population from './pages/databank/Population';
import Neighborhoods from './pages/databank/Neighborhoods';
import Tribes from './pages/databank/Tribes';
import Schools from './pages/databank/Schools';
import Facilities from './pages/databank/Facilities';
import Properties from './pages/databank/Properties';
import SocialSupport from './pages/databank/SocialSupport';
import GISMap from './pages/databank/Map';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSetup, setIsSetup] = useState(true); // Assume setup until checked

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
    
    // Check if setup is needed
    fetch('/api/auth/setup')
      .then(res => {
        if (res.status === 400) setIsSetup(true);
        else setIsSetup(false);
      })
      .catch(() => setIsSetup(true));
  }, []);

  if (!isSetup) {
    return <Setup onComplete={() => setIsSetup(true)} />;
  }

  const userRole = localStorage.getItem('userRole') || 'viewer';

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/machinery/:id" element={
          <div dir="rtl" className="min-h-screen bg-gray-50 font-sans">
            <MachineryDetails />
          </div>
        } />
        <Route path="/employees/:id" element={
          <div dir="rtl" className="min-h-screen bg-gray-50 font-sans">
            <EmployeeDetails />
          </div>
        } />

        {/* Protected Routes */}
        <Route path="/*" element={
          !isAuthenticated ? (
            <Login onLogin={() => setIsAuthenticated(true)} />
          ) : (
            <Layout onLogout={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('userRole');
              localStorage.removeItem('username');
              setIsAuthenticated(false);
            }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/developer" element={<Developer />} />
                
                {/* Common Routes based on roles */}
                {(userRole === 'admin' || userRole === 'diwan' || userRole === 'employee') && (
                  <Route path="/tasks" element={<Tasks />} />
                )}
                
                {(userRole === 'admin' || userRole === 'diwan') && (
                  <>
                    <Route path="/decisions" element={<Decisions />} />
                    <Route path="/meetings" element={<Meetings />} />
                    <Route path="/morning-report" element={<MorningReport />} />
                  </>
                )}

                {(userRole === 'admin' || userRole === 'accountant') && (
                  <Route path="/budget" element={<Budget />} />
                )}

                {(userRole === 'admin' || userRole === 'accountant') && (
                  <Route path="/employees" element={<Employees />} />
                )}

                {(userRole === 'admin' || userRole === 'employee') && (
                  <Route path="/machinery" element={<Machinery />} />
                )}

                {(userRole === 'admin' || userRole === 'diwan' || userRole === 'accountant') && (
                  <Route path="/documents" element={<Documents />} />
                )}

                {(userRole === 'admin' || userRole === 'employee') && (
                  <>
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/complaints" element={<Complaints />} />
                    <Route path="/licenses" element={<Licenses />} />
                    <Route path="/databank/map" element={<GISMap />} />
                  </>
                )}

                {userRole === 'admin' && (
                  <>
                    <Route path="/activity" element={<Activity />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/backups" element={<Backups />} />
                    
                    {/* Data Bank Routes */}
                    <Route path="/databank" element={<DataBank />} />
                    <Route path="/databank/population" element={<Population />} />
                    <Route path="/databank/neighborhoods" element={<Neighborhoods />} />
                    <Route path="/databank/tribes" element={<Tribes />} />
                    <Route path="/databank/schools" element={<Schools />} />
                    <Route path="/databank/facilities" element={<Facilities />} />
                    <Route path="/databank/properties" element={<Properties />} />
                    <Route path="/databank/social-support" element={<SocialSupport />} />
                  </>
                )}

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;

