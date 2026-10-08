# Optional 3D models

The site ships with a lightweight **SVG avatar system** (`templates/partials/avatars.html`
+ `static/css/avatars.css` + `static/js/modules/avatars.js`). It needs no files from this folder.

If you later commission true 3D characters, export them as compressed `.glb`
(Draco or Meshopt, ideally < 1.5 MB each) and place them here, e.g.:

    static/models/writer.glb
    static/models/receiver.glb

The pose names used by the site (wave, offer, comfort, embrace, uplift, joy, calm,
reading) map directly to animation clip names, so a Three.js loader can call the
same `AvatarScene.setPose()` API. Keep the SVG version as the mobile/reduced-motion fallback.
