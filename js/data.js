/* =========================================================
   SITE CONTENT: the only file you need to edit.
   ---------------------------------------------------------
   Every section starts empty. Until there is real media, the
   site fills the collage with generated "sound images"
   (spectrograms, waveforms, Chladni figures, Lissajous curves).
   As soon as you add items with an `image`, your real images
   replace those placeholders in the collage and the strip.

   Item format:
   {
     title: "Resonant Rooms",
     year: 2025,
     location: "Berlin, Germany",
     medium: "8-channel installation",
     category: "Installation",
     image: "media/resonant-rooms.jpg",   // optional
     audio: "media/resonant-rooms.mp3",   // optional
     video: "https://player.vimeo.com/video/…", // optional (embed URL)
     link:  "https://…",                  // optional
     description: "Short text about the piece."
   }
   Put images / audio in a /media folder in the repo.
   ========================================================= */

window.SITE = {
  artist: {
    name: "Carlos Villamizar",
    role: "Sound Artist",
    city: "Berlin",
    email: "",       // e.g. "hello@carlosvillamizar.com"
    instagram: ""    // e.g. "https://instagram.com/…"
  },

  // Show the "Hi!" box on first visit
  greeting: true,

  sections: [
    { id: "works",    title: "Works",    items: [] },
    { id: "releases", title: "Releases", items: [] },
    { id: "about",    title: "About",    items: [] },
    { id: "contact",  title: "Contact",  items: [] }
  ],

  filters: ["Year", "Medium", "Location", "Categories", "Latest"]
};
