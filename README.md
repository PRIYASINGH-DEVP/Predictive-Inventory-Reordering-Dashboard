# StockPilot - AI Predictive Inventory Reordering Dashboard
Frontend only: HTML5, CSS3 and vanilla JavaScript. All data lives in LocalStorage (keys start with `sp:`).

## Run
Open `index.html` in a browser (double-click works). An internet connection is needed for the Google Font and the CDN libraries
(GSAP, Three.js, Chart.js, jsPDF). Without it the app still works, but 3D scenes, charts and PDF export are unavailable.
Optional local server: `python3 -m http.server 8000`, then open http://localhost:8000.

## Pages
index (splash) > login / signup / forgot-password > dashboard, inventory, predictions, analytics, reports, settings.
Create an account on the sign-up page; demo products and sales load automatically on first run.

## How the AI prediction works
daily rate = units sold in 30 days / 30; days left = stock / daily rate;
reorder quantity = daily rate x (14 lead days + 7 safety days) - stock.
Fast / slow movers are compared with the average seller. Health score drops for out-of-stock, low-stock and slow items.
See `assets/js/core/predict.js`.

## Notes
- Authentication is a demo: passwords are hashed in the browser and stored in LocalStorage. It is not secure for real use.
- Keyboard: press `/` to focus search, `Esc` closes menus and dialogs.
- Not included: Spline scenes, AOS and Reset-password email (needs a backend).
