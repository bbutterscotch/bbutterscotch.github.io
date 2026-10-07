# emilyroot.com

## Desk Computer pages

Production version of the Claude Design `Desk Computer.html` handoff. Plain static HTML/CSS/JS with no build step.
`index.html` is the 3D desk, so emilyroot.com opens on it. The previous Bootstrap site is kept at `classic.html`.

| File | What it is |
|---|---|
| `index.html`, `css/desk.css`, `js/desk.js`, `js/stage.js` | The 3D desk (three.js 0.184 from unpkg, pinned with integrity hashes). Click the lava lamp to switch between light and dark. Click the monitor to zoom into the desktop, or the phone to open the phone view. |
| `desktop.html`, `css/desktop.css`, `js/desktop.js` | The desktop the monitor zooms into: windows you can drag, a project browser, a resume preview, a contact form (Web3Forms), a Start menu and a light/dark switch. Opened on its own, **⏏ Leave** goes to the desk. |
| `phone.html`, `css/phone.css`, `js/phone.js` | The phone the desk zooms into: a home screen where each page is an app (Code, Games, Jams, About, Mail, Resume, Settings), plus links and a Desk app that puts the phone down. Opened on its own, it fits a phone-sized screen. |
| `js/is-phone.js` | Detects a real phone (touch-only, phone-sized screen). Phones are sent from the desk and desktop to `phone.html`, which then drops the drawn phone chrome and the ways back to the desk, keeps clear of the notch and home indicator, and lets the back button close projects and apps. |
| `js/projects.js` | The project list, shared by the desktop and the phone. |

Pages talk to the desk with `postMessage`: `{type:'er-theme', theme}` goes into each page, and `{type:'er-exit'}` comes back out.

Changes from the prototype:
- The OBJ/GLB download buttons are gone. The orbit/zoom hint stays, and its color follows the lamp.
- The prototype ran on the design tool's runtime (`support.js`); the desktop page is now plain JavaScript.

To try it locally, serve this folder (for example `python3 -m http.server`) and open `index.html`.
