import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SiteLayout } from '@/layouts/SiteLayout'
import { BoardEditorPage } from '@/pages/BoardEditorPage'
import { BoardsListPage } from '@/pages/BoardsListPage'
import { HomePage } from '@/pages/HomePage'
import { SchoolsPage } from '@/pages/SchoolsPage'
import { PresentPage } from '@/pages/PresentPage'
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/present" element={<PresentPage />} />
        <Route path="/boards/:id" element={<BoardEditorPage />} />
        <Route
          path="/boards"
          element={
            <SiteLayout>
              <BoardsListPage />
            </SiteLayout>
          }
        />
        <Route
          path="/"
          element={
            <SiteLayout>
              <HomePage />
            </SiteLayout>
          }
        />
        <Route
          path="/schools"
          element={
            <SiteLayout>
              <SchoolsPage />
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
