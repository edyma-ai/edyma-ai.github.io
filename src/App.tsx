import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SiteLayout } from '@/layouts/SiteLayout'
import { HomePage } from '@/pages/HomePage'
import { PresentPage } from '@/pages/PresentPage'
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/present" element={<PresentPage />} />
        <Route
          path="/"
          element={
            <SiteLayout>
              <HomePage />
            </SiteLayout>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <SiteLayout>
              <PrivacyPolicyPage />
            </SiteLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
