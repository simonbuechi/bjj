import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import TechniqueDetails from './pages/TechniqueDetails';
import TechniqueForm from './pages/TechniqueForm';
import Journal from './pages/Journal';

function App() {
  return (
    <AuthProvider>
      <Router basename="/bjj/">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="techniques/:id" element={<TechniqueDetails />} />
            <Route
              path="techniques/new"
              element={
                <ProtectedRoute>
                  <TechniqueForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="techniques/:id/edit"
              element={
                <ProtectedRoute>
                  <TechniqueForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="journal"
              element={
                <ProtectedRoute>
                  <Journal />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
