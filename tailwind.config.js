import tealPreset from '@kryv/teal/tailwind-preset'

/** @type {import('tailwindcss').Config} */
export default {
  presets: [tealPreset],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
}
