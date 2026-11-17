/* =========================================================
   SITE CONTENT: the only file you need to edit.
   ---------------------------------------------------------
   Every section starts empty. Until there is real media, the
   site fills the collage with generated "sound images"
   (spectrograms, waveforms, Chladni figures, Lissajous curves).
   As soon as you add items with an `image`, your real images
   replace those placeholders in the collage and the strip.

   Text sections (like About) use `text: [ "line", "line", … ]`
   instead of items: every entry is shown as its own line.

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
    {
      id: "releases", title: "Releases",
      items: [
        {
          type: "release",
          title: "Sueños Ligeros",
          year: 2021,
          date: "29.01.2021",
          released: "2021-01-29",
          label: "Hoy Records",
          format: "Limited edition cassette · Digital",
          location: "Hoy Records · Cassette",
          image: "media/releases/suenos-ligeros/cover.jpg",
          thumb: "media/releases/suenos-ligeros/cover-640.jpg",
          accent: "#3f6fd6",
          artwork: "Nicolas Galeano",
          lowercase: true,          // track titles in lowercase, like the cassette labels
          text: "Limited edition tape for the debut of Carlos Villamizar on Hoy Records. Five tracks, five poems, five windows of dreamworld reminiscences. An exploration of the relationship between the psyche and the dream realms.",
          textEs: "Cassette de edición limitada para el debut del artista sonoro Carlos Villamizar en Hoy Records. Cinco canciones, cinco poemas, cinco ventanas de recuerdos del mundo de los sueños. Una exploración de la relación entre la psique humana y la incursión onírica.",
          // Sides and order as printed on the cassette; durations from Bandcamp
          sides: [
            { name: "Lado A Side", tracks: [["Primer sueño", "6:27"], ["Sacudida hípnica ft. Nicolas Rosero", "7:55"]] },
            { name: "Lado B Side", tracks: [["Segundo sueño", "4:19"], ["Tercer sueño", "5:16"], ["Cuarto sueño", "5:20"]] }
          ],
          credits: [
            "Artwork_ Nicolas Galeano",
            "Mastering_ Miguel Isaza at Momoto studio",
            "Composition, performance and mixing_ Carlos Villamizar in Berlin"
          ],
          bandcamp: { album: 7866375, url: "https://hoyrecords.bandcamp.com/album/sue-os-ligeros" },
          gallery: [
            { src: "media/releases/suenos-ligeros/cassettes-side-a.jpg", caption: "Cassettes, Lado A" },
            { src: "media/releases/suenos-ligeros/cassettes-a-b.jpg", caption: "Lado A / Lado B" },
            { src: "media/releases/suenos-ligeros/jcard-insert.jpg", caption: "J-card insert" },
            { src: "media/releases/suenos-ligeros/cassettes-spines.jpg", caption: "Spines" },
            { src: "media/releases/suenos-ligeros/cassettes-side-b.jpg", caption: "Cassettes, Lado B" }
          ]
        },
        {
          type: "release",
          title: "sense of inflowing unknown",
          year: 2020,
          date: "07.01.2020",
          released: "2020-01-07",
          label: "Zonas",
          format: "Limited edition cassette, 200 copies · Digital",
          location: "Zonas · Cassette",
          image: "media/releases/sense-of-inflowing-unknown/cover.jpg",
          thumb: "media/releases/sense-of-inflowing-unknown/cover-640.jpg",
          accent: "#b4432f",
          artwork: "Nicolás Rosero",
          text: "Using field recordings and granular synthesis as a primary basis of composition, treating ambient sounds as sculptural textures, encouraging the listener to contemplate and evoque sonic atmospheres.",
          // Sides as printed on the J-card; durations from Bandcamp
          sides: [
            { name: "Side A", tracks: [["Inkling", "5:14"], ["811", "2:56"], ["Vat-I", "4:48"], ["Shoulder to Shoulder", "6:34"]] },
            { name: "Side B", tracks: [["Tilope", "3:09"], ["Anima", "15:28"], ["Nood", "5:04"]] }
          ],
          credits: [
            "written and produced by Carlos Pablo Villamizar",
            "published under Zonas",
            "artwork by Nicolás Rosero",
            "Berlin 2019-2020"
          ],
          bandcamp: { album: 254438667, url: "https://carlosvillamizar.bandcamp.com/album/sense-of-inflowing-unknown" },
          gallery: [
            { src: "media/releases/sense-of-inflowing-unknown/cassette-stack.jpg", caption: "Cassettes, side A" },
            { src: "media/releases/sense-of-inflowing-unknown/jcard-sides-a-b.jpg", caption: "J-card, sides A / B" },
            { src: "media/releases/sense-of-inflowing-unknown/cassettes-and-cases.jpg", caption: "Cassettes and cases" }
          ]
        }
      ]
    },
    {
      id: "about", title: "About", items: [],
      // Shown exactly as written: one entry per line.
      text: [
        "CARLOS VILLAMIZAR",
        "Geboren / Born in Bogotá-Colombia",
        "Lebt seit / lives since 1989",
        "Musiker, Audioproduzent und Klangkünstler / Musician, Sound Producer and Sound Artist",
        "in Deutschland-Berlin / in Germany-Berlin",
        "seit / since 2014",
        "-Worksbasedontemporalandspatialmannersrelatedtosound."
      ]
    },
    {
      id: "contact", title: "Contact", items: [],
      // Contact form. Messages are forwarded to this address by FormSubmit
      // (formsubmit.co). The first message triggers an activation email that
      // must be confirmed once. After that, FormSubmit offers a random alias:
      // put it here instead of the address to keep the email out of the page.
      form: { to: "sonicinclusion@gmail.com" }
    }
  ],

  filters: ["Year", "Medium", "Location", "Categories", "Latest"]
};
