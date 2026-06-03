import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from './components/Layout'
import AuthGuard from './components/AuthGuard'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import CalendarPage from './pages/CalendarPage'
import ProgramsPage from './pages/ProgramsPage'
import ProgramWizardPage from './pages/ProgramWizardPage'
import CreateProgramPage from './pages/CreateProgramPage'
import ClientProfilePage from './pages/ClientProfilePage'
import ClientsPage from './pages/ClientsPage'
import AddClientPage from './pages/AddClientPage'
import NutritionPage from './pages/NutritionPage'
import SettingsPage from './pages/SettingsPage'
import PhotosPage from './pages/PhotosPage'
import ExercisesPage from './pages/ExercisesPage'
import ProgramBuilderPage from './pages/ProgramBuilderPage'
import ProgramMatcherPage from './pages/ProgramMatcherPage'
import PlannedFeaturesPage from './pages/PlannedFeaturesPage'
import AdminDashboardPage from './pages/AdminDashboardPage'

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Layout>{children}</Layout>
    </AuthGuard>
  )
}

function AnimatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedRoute><LandingPage /></AnimatedRoute>} />
        <Route path="/login" element={<AnimatedRoute><LoginPage /></AnimatedRoute>} />
        <Route path="/signup" element={<AnimatedRoute><SignupPage /></AnimatedRoute>} />
        <Route path="/dashboard" element={<ProtectedLayout><AnimatedRoute><DashboardPage /></AnimatedRoute></ProtectedLayout>} />
        <Route path="/calendar" element={<ProtectedLayout><AnimatedRoute><CalendarPage /></AnimatedRoute></ProtectedLayout>} />
        <Route path="/programs" element={<ProtectedLayout><AnimatedRoute><ProgramsPage /></AnimatedRoute></ProtectedLayout>} />
        <Route path="/programs/new" element={<ProtectedLayout><AnimatedRoute><ProgramWizardPage /></AnimatedRoute></ProtectedLayout>} />
        <Route path="/programs/create" element={<ProtectedLayout><AnimatedRoute><CreateProgramPage /></AnimatedRoute></ProtectedLayout>} />
        <Route path="/clients/:id" element={<ProtectedLayout><AnimatedRoute><ClientProfilePage /></AnimatedRoute></ProtectedLayout>} />
        <Route path="/clients" element={<ProtectedLayout><AnimatedRoute><ClientsPage /></AnimatedRoute></ProtectedLayout>} />
        <Route path="/clients/add" element={<ProtectedLayout><AnimatedRoute><AddClientPage /></AnimatedRoute></ProtectedLayout>} />
        <Route path="/nutrition" element={<ProtectedLayout><AnimatedRoute><NutritionPage /></AnimatedRoute></ProtectedLayout>} />
        <Route path="/settings" element={<ProtectedLayout><AnimatedRoute><SettingsPage /></AnimatedRoute></ProtectedLayout>} />
        <Route path="/photos" element={<ProtectedLayout><AnimatedRoute><PhotosPage /></AnimatedRoute></ProtectedLayout>} />
        <Route path="/exercises" element={<ProtectedLayout><AnimatedRoute><ExercisesPage /></AnimatedRoute></ProtectedLayout>} />
        <Route path="/programs/session/quick" element={<ProtectedLayout><AnimatedRoute><ProgramBuilderPage /></AnimatedRoute></ProtectedLayout>} />
        <Route path="/programs/session/:programId" element={<ProtectedLayout><AnimatedRoute><ProgramBuilderPage /></AnimatedRoute></ProtectedLayout>} />
        <Route path="/programs/match" element={<ProtectedLayout><AnimatedRoute><ProgramMatcherPage /></AnimatedRoute></ProtectedLayout>} />
        <Route path="/roadmap" element={<ProtectedLayout><AnimatedRoute><PlannedFeaturesPage /></AnimatedRoute></ProtectedLayout>} />
        <Route path="/admin" element={<ProtectedLayout><AnimatedRoute><AdminDashboardPage /></AnimatedRoute></ProtectedLayout>} />
      </Routes>
    </AnimatePresence>
  )
}
