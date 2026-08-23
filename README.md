

## Teacher area (Classroom Board)

`/teacher/login` signs a teacher in with email + password, or by "Link with phone": the page asks the API for a link code (`POST /api/v1/auth/link`), shows it as a QR (`edyma://link?code=...`) and polls `GET /api/v1/auth/link/{code}` until the teacher approves it from the Edyma app (Profile > Linked devices > Link a device). Either way the browser becomes a session the teacher can see and sign out from the app.

Protected routes under `/teacher` (`src/auth/ProtectedRoute.tsx`): classes and subjects (`GET /teacher/classroom`) > chapters > a chapter board with shared study guides, interactive sims (sandboxed `srcdoc` iframes) and videos > a TLM reader with freehand annotations saved per teacher and TLM (`PUT /tlm-modules/{id}/annotations`). Tokens live in `localStorage` (`edyma_site_access` / `edyma_site_refresh`); `src/lib/api.ts` refreshes once on a 401 and signs out only on a definitive rejection. `/present` is unchanged and needs no sign-in.

