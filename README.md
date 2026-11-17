# Carlos Villamizar — Sound Artist

Personal website. Plain HTML, CSS and JavaScript, so there's no build step and it's ready for GitHub Pages.

## Structure

```
index.html      page skeleton
css/style.css   all styling
js/data.js      ← your content (sections, works, links)
js/art.js       generated "sound images" used as placeholders
js/main.js      interactions (collage, strip, archive, measure mode, routing)
media/          put your images / audio here (create when needed)
```

## Adding content

Edit only `js/data.js`. Each section (Works, Sound, Exhibitions, Events, Texts, About, Contact) has an empty `items: []` array. Add objects like this:

```js
{
  title: "Resonant Rooms",
  year: 2025,
  location: "Berlin, DE",
  medium: "8-channel installation",
  image: "media/resonant-rooms.jpg",
  audio: "media/resonant-rooms.mp3",
  description: "Short text about the piece."
}
```

Empty sections show a "Forthcoming" state automatically. Until you add items with an `image`, the home collage and the right strip show generated placeholders (spectrograms, waveforms, Chladni and Lissajous figures). Your real images replace them automatically. Add your email and Instagram in `artist` and they appear in the menu.

To rename, add or remove menu sections, edit the `sections` list. Each `id` becomes the URL (`/#works`).

## Publish on GitHub Pages

1. Create a new repo, e.g. `carlos-villamizar`.
2. Upload these files to the root, or push them:
   ```bash
   git init
   git add .
   git commit -m "First version"
   git branch -M main
   git remote add origin https://github.com/<your-user>/carlos-villamizar.git
   git push -u origin main
   ```
3. In the repo go to **Settings → Pages**, choose **Deploy from a branch**, then **main / (root)**.
4. The site goes live at `https://<your-user>.github.io/carlos-villamizar/`.

## Preview locally

Open `index.html` in a browser, or run `python3 -m http.server` in this folder and visit `http://localhost:8000`.
