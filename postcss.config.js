// The cascade-layers polyfill rewrites `@layer` rules using specificity hacks for
// browsers without native cascade-layer support (the legacy production bundle for
// old Android, built via @vitejs/plugin-legacy). That emulation is incompatible
// with Tailwind v4's layer model and breaks hover/variant styles in dev, where we
// always run on a modern browser with native `@layer`. So apply it for production
// builds only — dev uses native layers and keeps hover/variants working.
const isProduction = process.env.NODE_ENV === 'production'

export default {
  plugins: {
    ...(isProduction ? { '@csstools/postcss-cascade-layers': {} } : {}),
    'postcss-custom-properties': { preserve: true },
  },
}
