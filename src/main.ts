import './style.css'

const PRIVACY_DOC_URL =
  'https://docs.google.com/document/d/1ZUF4OfXcDkNMAvTWPWu0_-oQbk-tA-FxH-uJ6shbVic/view?usp=sharing'

function normalizePath(pathname: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '') || ''
  let p = pathname
  if (base && p.startsWith(base)) {
    p = p.slice(base.length) || '/'
  }
  if (!p.startsWith('/')) p = '/' + p
  return p.replace(/\/+$/, '') || '/'
}

function renderHome(root: HTMLElement): void {
  root.innerHTML = `
    <main class="shell">
      <h1>Coming soon</h1>
      <p class="tagline">Edyma — personalized learning powered by AI.</p>
      <footer>
        <a href="/policy">Privacy policy</a>
      </footer>
    </main>
  `
}

function renderPolicy(root: HTMLElement): void {
  root.innerHTML = `
    <main class="shell">
      <div class="policy-body">
        <a class="back" href="/">← Back</a>
        <h1>Privacy policy</h1>
        <p>
          Our privacy policy is hosted as a living document. Use the link below to read the current version.
        </p>
        <a
          class="doc-link"
          href="${PRIVACY_DOC_URL}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open privacy policy (Google Doc)
        </a>
      </div>
    </main>
  `
}

function route(): void {
  const root = document.getElementById('app')
  if (!root) return

  const path = normalizePath(window.location.pathname)
  if (path === '/policy') {
    renderPolicy(root)
  } else {
    renderHome(root)
  }
}

route()
window.addEventListener('popstate', route)
