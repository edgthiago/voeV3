import { BrowserRouter } from 'react-router-dom'
import './App.css'
import './styles/monitoring.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import AppRoutes from './routes/AppRoutes'
import MainLayout from './layouts/MainLayout'
import { ProvedorCarrinho } from './context/ContextoCarrinho'
import { FormProvider } from './context/FormContext'
import { AuthProvider } from './context/AuthContext'
import LoginAutomaticoBanner from './components/auth/LoginAutomaticoBanner'



function App() {
  return (
    <AuthProvider>
      <ProvedorCarrinho>
        <FormProvider>
          <BrowserRouter>
            <MainLayout>
              <LoginAutomaticoBanner />
              <AppRoutes />
            </MainLayout>
          </BrowserRouter>
        </FormProvider>
      </ProvedorCarrinho>
    </AuthProvider>
  )
}

export default App
