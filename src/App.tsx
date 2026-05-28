import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import TabBar from './components/layout/TabBar'
import LoginPage from './pages/LoginPage'
import RecettesPage from './pages/RecettesPage'
import RecetteDetailPage from './pages/RecetteDetailPage'
import EpiceriePage from './pages/EpiceriePage'
import ListeDetailPage from './pages/ListeDetailPage'
import PlanSemainePage from './pages/PlanSemainePage'
import SuggestionsPage from './pages/SuggestionsPage'
import ParametresPage from './pages/ParametresPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-full text-gray-300 text-sm">Chargement...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">{children}</div>
      <TabBar />
    </div>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-full text-gray-300 text-sm">Chargement...</div>

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/recettes" replace /> : <LoginPage />} />
      <Route path="/" element={<Navigate to="/recettes" replace />} />
      <Route
        path="/recettes"
        element={
          <PrivateRoute>
            <Layout><RecettesPage /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/recettes/:id"
        element={
          <PrivateRoute>
            <Layout><RecetteDetailPage /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/epicerie"
        element={
          <PrivateRoute>
            <Layout><EpiceriePage /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/epicerie/:listeId"
        element={
          <PrivateRoute>
            <Layout><ListeDetailPage /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/plan"
        element={
          <PrivateRoute>
            <Layout><PlanSemainePage /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/suggestions"
        element={
          <PrivateRoute>
            <Layout><SuggestionsPage /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/parametres"
        element={
          <PrivateRoute>
            <Layout><ParametresPage /></Layout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/recettes" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/bouffe">
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
