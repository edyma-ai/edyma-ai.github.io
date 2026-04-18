(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`https://docs.google.com/document/d/1ZUF4OfXcDkNMAvTWPWu0_-oQbk-tA-FxH-uJ6shbVic/view?usp=sharing`;function t(e){let t=`/`.replace(/\/$/,``)||``,n=e;return t&&n.startsWith(t)&&(n=n.slice(t.length)||`/`),n.startsWith(`/`)||(n=`/`+n),n.replace(/\/+$/,``)||`/`}function n(e){e.innerHTML=`
    <main class="shell">
      <h1>Coming soon</h1>
      <p class="tagline">Edyma — personalized learning powered by AI.</p>
      <footer>
        <a href="/policy">Privacy policy</a>
      </footer>
    </main>
  `}function r(t){t.innerHTML=`
    <main class="shell">
      <div class="policy-body">
        <a class="back" href="/">← Back</a>
        <h1>Privacy policy</h1>
        <p>
          Our privacy policy is hosted as a living document. Use the link below to read the current version.
        </p>
        <a
          class="doc-link"
          href="${e}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open privacy policy (Google Doc)
        </a>
      </div>
    </main>
  `}function i(){let e=document.getElementById(`app`);e&&(t(window.location.pathname)===`/policy`?r(e):n(e))}i(),window.addEventListener(`popstate`,i);