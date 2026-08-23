import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthContext'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { ClassroomLayout } from '@/components/classroom/ClassroomLayout'
import { SiteLayout } from '@/layouts/SiteLayout'
import { BoardEditorPage } from '@/pages/BoardEditorPage'
import { BoardsListPage } from '@/pages/BoardsListPage'
import { HomePage } from '@/pages/HomePage'
import { SchoolsPage } from '@/pages/SchoolsPage'
import { PresentPage } from '@/pages/PresentPage'
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage'
import { ChapterBoardPage } from '@/pages/teacher/ChapterBoardPage'
import { ChaptersPage } from '@/pages/teacher/ChaptersPage'
import { ClassroomHomePage } from '@/pages/teacher/ClassroomHomePage'
import { TeacherLoginPage } from '@/pages/teacher/TeacherLoginPage'
import { TlmBoardPage } from '@/pages/teacher/TlmBoardPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
          <Route path="/teacher/login" element={<TeacherLoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/teacher" element={<ClassroomLayout />}>
              <Route index element={<ClassroomHomePage />} />
              <Route path=":classId/:subjectId" element={<ChaptersPage />} />
              <Route path=":classId/:subjectId/:chapterId" element={<ChapterBoardPage />} />
              <Route path=":classId/:subjectId/:chapterId/tlm/:tlmId" element={<TlmBoardPage />} />
            </Route>
          </Route>
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
      </AuthProvider>
    </BrowserRouter>
  )
}
