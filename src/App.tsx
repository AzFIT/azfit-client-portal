import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import CalendarPage from './pages/CalendarPage'
import ProgramsPage from './pages/ProgramsPage'
import ProgramWizardPage from './pages/ProgramWizardPage'
import AllInOneProgramPage from './pages/AllInOneProgramPage'
import ClientProfilePage from './pages/ClientProfilePage'
import ClientsPage from './pages/ClientsPage'
import NutritionPage from './pages/NutritionPage'
import SettingsPage from './pages/SettingsPage'
import PhotosPage from './pages/PhotosPage'
import PlannedFeaturesPage from './pages/PlannedFeaturesPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
      <Route path="/calendar" element={<Layout><CalendarPage /></Layout>} />
      <Route path="/programs" element={<Layout><ProgramsPage /></Layout>} />
      <Route path="/programs/new" element={<Layout><ProgramWizardPage /></Layout>} />
      <Route path="/programs/create" element={<Layout><AllInOneProgramPage /></Layout>} />
      <Route path="/clients/:id" element={<Layout><ClientProfilePage /></Layout>} />
      <Route path="/clients" element={<Layout><ClientsPage /></Layout>} />
      <Route path="/nutrition" element={<Layout><NutritionPage /></Layout>} />
      <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
      <Route path="/photos" element={<Layout><PhotosPage /></Layout>} />
      <Route path="/roadmap" element={<Layout><PlannedFeaturesPage /></Layout>} />
    </Routes>
  )
}
