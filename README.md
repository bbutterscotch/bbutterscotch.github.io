# emilyroot.com

## Desk Computer pages

Production version of the Claude Design `Desk Computer.html` handoff. Plain static HTML/CSS/JS with no build step.
`index.html` is the existing site and is unchanged.

| File | What it is |
|---|---|
| `desk.html`, `css/desk.css`, `js/desk.js`, `js/stage.js` | The 3D desk (three.js 0.184 from unpkg, pinned with integrity hashes). Click the lava lamp to switch between light and dark. Click the monitor to zoom into the desktop, or the phone to open the phone view. |
| `desktop.html`, `css/desktop.css`, `js/desktop.js` | The desktop the monitor zooms into: windows you can drag, a project browser, a resume preview, a contact form (Web3Forms), a Start menu and a light/dark switch. Opened on its own, **⏏ Leave** goes to `desk.html`. |
| `phone.html` | Placeholder for the phone. The full phone home screen (`Emily Phone.dc.html`) is not built yet. |

Pages talk to the desk with `postMessage`: `{type:'er-theme', theme}` goes into each page, and `{type:'er-exit'}` comes back out.

Changes from the prototype:
- The OBJ/GLB download buttons are gone. The orbit/zoom hint stays, and its color follows the lamp.
- The prototype ran on the design tool's runtime (`support.js`); the desktop page is now plain JavaScript.

To try it locally, serve this folder (for example `python3 -m http.server`) and open `desk.html`.
