# TraceIQ — AI-Powered Incident Intelligence

Incident-response UI: Incident → Historical context → Investigation → Recommended action → Resolution.

## Run
Extract the folder and open `index.html` in a modern browser. No build step, server, or internet connection needed.

## Structure
- `index.html` – app shell (sidebar, header, theme switch, Ask TraceIQ drawer)
- `css/style.css` – light/dark design tokens, responsive layout, components
- `js/script.js` – demo incident data, pages, search/filters, chat, settings, theme logic
- `assets/favicon.svg` – TraceIQ logo icon (the in-app logo is inline SVG in `index.html`)

## Light / Dark mode
Toggle in the header. The choice is saved in localStorage (`traceiq-theme`); on first visit the system preference is used.

## Connecting real data
The incidents, memory and chat replies are demo data in the `incidents` array at the top of `js/script.js`. Replace it with your API responses; the render functions read only those fields.
