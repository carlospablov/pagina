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
  greeting: false,

  sections: [
    {
      id: "works", title: "Works",
      items: [
        {
          type: "work",
          title: "Naked Singularity",
          category: "Installation",
          medium: "Audio-installation",
          subtitle: "Audio-installation that explores the cosmic background from electromagnetic noise.",
          year: 2017,
          location: "Berlin / Szczecin",
          exhibitions: [
            { title: "48 Stunden Neukölln", place: "Berlin", date: "Jun/2017" },
            { title: "Młode Wilki Festival", place: "Szczecin", date: "Nov/2017" }
          ],
          image: "media/works/naked-singularity/installation-view.jpg",
          thumb: "media/works/naked-singularity/installation-view-720.jpg",
          imageCaption: "Installation view · Młode Wilki Festival, Szczecin",
          audio: {
            src: "media/works/naked-singularity/naked-singularity.mp3",
            label: "Excerpt",
            // waveform outline of the recording (0–1), drawn by the player
            peaks: [0.691, 0.835, 0.742, 0.751, 0.65, 0.718, 0.748, 0.834, 0.74, 0.806, 0.647, 0.733, 0.694, 0.974, 0.781, 0.675, 0.613, 0.634, 0.789, 0.668, 0.805, 0.807, 0.707, 0.928, 0.854, 0.794, 0.834, 0.975, 0.715, 0.767, 0.642, 0.676, 0.77, 0.666, 0.722, 0.74, 0.843, 0.764, 0.651, 0.796, 0.821, 0.809, 0.788, 0.716, 0.813, 0.773, 0.784, 0.856, 0.942, 0.697, 0.715, 0.673, 0.665, 0.702, 0.946, 0.686, 0.807, 0.901, 0.766, 0.727, 0.761, 0.82, 0.735, 0.787, 0.759, 0.788, 0.7, 0.837, 0.822, 0.735, 0.72, 0.669, 0.695, 0.657, 0.735, 0.753, 0.825, 0.761, 0.736, 0.834, 0.815, 0.699, 0.66, 0.697, 0.838, 0.718, 0.633, 0.668, 0.877, 0.688, 0.813, 0.749, 0.775, 0.613, 0.669, 0.645, 0.753, 0.667, 0.708, 0.84, 0.763, 0.759, 1.0, 0.822, 0.776, 0.654, 0.698, 0.737, 0.639, 0.74, 0.768, 0.79, 0.8, 0.637, 0.831, 0.655, 0.744, 0.745, 0.856, 0.851, 0.808, 0.777, 0.766, 0.696, 0.626, 0.74, 0.899, 0.801, 0.706, 0.694, 0.672, 0.702, 0.761, 0.742, 0.703, 0.674, 0.692, 0.785, 0.621, 0.744, 0.682, 0.76, 0.7, 0.793, 0.726, 0.739, 0.667, 0.722, 0.778, 0.918, 0.816, 0.792, 0.745, 0.737, 0.713, 0.768, 0.676, 0.744, 0.677, 0.852, 0.709, 0.781, 0.692, 0.768, 0.691, 0.953, 0.647, 0.661, 0.682, 0.672, 0.763, 0.646, 0.569, 0.753, 0.745, 0.766, 0.641, 0.6, 0.668, 0.824]
          },
          gallery: [
            { src: "media/works/naked-singularity/satellite-dish.jpg", caption: "Satellite dish and receiver · Młode Wilki Festival, Szczecin" },
            { src: "media/works/naked-singularity/opening.jpg", caption: "Opening · Młode Wilki Festival, Szczecin" },
            { src: "media/works/naked-singularity/visitors.jpg", caption: "Visitors · Młode Wilki Festival, Szczecin" },
            { src: "media/works/naked-singularity/floor-plan.jpg", caption: "Floor plan" },
            { src: "media/works/naked-singularity/red-blue-light.jpg", caption: "Red and blue light · 48 Stunden Neukölln, Berlin" }
          ],
          text: "An untuned radio frequency reveals the shadows of electromagnetic noise, residues of the cosmic background and of our own electronics. Built on a low-frequency sound system, the installation reproduces the sound of a hacked radio and of radio telescopes, tuned to an unused frequency. Passed through a filter-modulator unit, the signal radiates outward as abstract, processed radio waves."
        },
        {
          type: "work",
          title: "Vestige",
          category: "Site-specific installation",
          medium: "Site-specific sound installation",
          subtitle: "Site-specific sound installation in an industrial stairwell, where echoes become a way of perceiving space.",
          year: 2018,
          location: "Berlin-Alt-Hohenschönhausen",
          image: "media/works/vestige/stairwell-stills.jpg",
          thumb: "media/works/vestige/stairwell-stills-720.jpg",
          video: {
            src: "media/works/vestige/vestige-collage.mp4",
            poster: "media/works/vestige/vestige-poster.jpg",
            caption: "Video collage · stairwell, ID Studios"
          },
          text: "Vestige is a site-specific sound installation inside a large industrial building in the former restricted area of Berlin-Alt-Hohenschönhausen, now home to artists' studios. The piece occupies one of the building's four industrial stairwells, closed off for the work and entered from the ground floor. Echoes become a means of perceiving space: the installation explores the psychological and physiological responses they provoke, orienting the experience towards locating oneself through sound reflected from the surfaces.",
          research: "Sound-oriented practices such as echolocation gather information from the environment through sensory substitution, using echoes to perceive space. Multisensory integration lets the senses interact, shaping our behaviour, perception and understanding of our surroundings. Being aware of the capacities of our attention, and cultivating these practices, leads to a more coherent and heightened comprehension of the environment. The accompanying research considers how mental states arise from sensory input, drawing on Intentionality and Functionalism as foundations for the meaning we attribute to objects and events.",
          exhibitions: [
            { title: "Masterausstellung UdK Berlin, ID Studios", place: "Genslerstraße 13–13a, Berlin", date: "2018" }
          ],
          gallery: [
            { src: "media/works/vestige/stair-section.jpg", caption: "Stairwell section, light and sound positions" },
            { src: "media/works/vestige/stairwell-stills.jpg", caption: "Stairwell stills" }
          ]
        }
      ]
    },
    {
      id: "releases", title: "Releases",
      items: [
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
        },
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
        }
      ]
    },
    {
      id: "collaborations", title: "Collaborations",
      items: [
        {
          type: "work",
          title: "Transparencies",
          category: "Record release, event & exhibition",
          medium: "Vinyl record, release event & exhibition · curation",
          subtitle: "A record release curated by Research and Waves with Nicolás Rosero and Carlos Villamizar, exploring the concept of Transparency from cultural, creative and scientific perspectives.",
          year: 2019,
          location: "Berlin / Bremen",
          image: "media/collaborations/transparencies/record-cover.jpg",
          soundcloud: "https://soundcloud.com/researchandwaves/sets/raw-0-4-y-0-75",
          imageCaption: "Record cover by Galina Kruzhilina",
          homeTitle: "Transparencies by Research and Waves",
          homeMeta: "Curator",
          roles: [
            { role: "Curators", name: "Research and Waves, Nicolás Rosero, Carlos Villamizar", link: "https://rawxyz.uber.space/projects/transparencies" },
            { role: "Cover design", name: "Galina Kruzhilina" }
          ],
          text: "Featuring work by seven international artists, poets, scientists and designers, the record looks at the concept of Transparency from a variety of cultural, creative and scientific perspectives. In conversation with the curatorial team, six of the contributors synthesised their interpretation of the theme in a five-minute audio piece, many of them working with the medium for the first time. Conceived not only as an exhibition or media release but as a joint research effort, the project touches on human intimacy, financial trading and pseudo-science, the material qualities of the everyday, neuroscience and artificial intelligence, digital surveillance, communication and collectivity, and colonial histories and public space.",
          textNote: "Text adapted from Research and Waves.",
          exhibitions: [
            { title: "Prelude I, Galerie Mitte im Kubo", place: "Bremen", date: "Dec/2018" },
            { title: "Prelude II, feldfünf", place: "Berlin", date: "Jan/2019" },
            { title: "Record release weekend, feldfünf", place: "Berlin", date: "Apr/2019" }
          ],
          credits: [
            "Louise Vind Nielsen — The music stops, and now what's that?",
            "Fritz Laszlo Weber — Creating the balance without a key",
            "Patrick Cruz — Frisson",
            "Jasmina Al-Qaisi — Applied tactics of self absolution",
            "Sam Conran — Gann",
            "Nicolás Gravel — Así es la life",
            "Cover: Galina Kruzhilina"
          ],
          creditsLabel: "Tracklist",
          galleryLayout: "pairs",
          gallery: [
            { src: "media/collaborations/transparencies/performance.jpg", caption: "Performance · release weekend, feldfünf, Berlin" },
            { src: "media/collaborations/transparencies/lecture.jpg", caption: "Lecture · release weekend, feldfünf, Berlin" },
            { src: "media/collaborations/transparencies/cover-print.jpg", caption: "Cover artwork, printed on fabric" },
            { src: "media/collaborations/transparencies/window.jpg", caption: "feldfünf, Berlin" }
          ],
          credit: "Images: Research and Waves"
        },
        {
          type: "work",
          title: "RIDE OR DIE",
          category: "Video installation",
          medium: "Video installation · sound & music",
          subtitle: "A video installation by Nina E. Schönefeld, with sound design and music supervision by Carlos Villamizar.",
          year: 2024,
          location: "Berlin",
          image: "media/collaborations/ride-or-die/installation-view-kindl.jpg",
          thumb: "media/collaborations/ride-or-die/installation-view-kindl-720.jpg",
          galleryLayout: "wide",
          gallery: [
            { src: "media/collaborations/ride-or-die/installation-view-kindl.jpg", caption: "Installation view · KINDL, Berlin · Photo © Jens Ziehe, 2024" },
            { src: "media/collaborations/ride-or-die/projection-audience.jpg", caption: "Projection with visitors · KINDL, Berlin" },
            { src: "media/collaborations/ride-or-die/kindl-exterior.jpg", caption: "KINDL – Zentrum für zeitgenössische Kunst, exterior · Photo © Marco Funke, 2019" }
          ],
          youtube: "yLcbI-uLZ7o",
          homeTitle: "RIDE OR DIE by Nina E. Schönefeld",
          homeMeta: "Sound design & music supervision",
          roles: [
            { role: "Written, edited & directed", name: "Nina E. Schönefeld", link: "https://www.ninaeschoenefeld.com/" },
            { role: "Director of photography", name: "Valentin Giebel" },
            { role: "Sound design & music supervision", name: "Carlos Villamizar" }
          ],
          text: "Nina E. Schönefeld's video installation RIDE OR DIE (2024), shown for the first time at KINDL, focuses on the moment of decision when relentless, radical resistance begins: against populist autocrats and the threat to the separation of powers and freedom of the press.",
          specs: "HD video · 30:13 · black and white & colour · sound",
          videoCaption: "ZDF aspekte, report on the exhibition at KINDL",
          exhibitions: [
            { title: "KINDL – Zentrum für zeitgenössische Kunst, M1 VideoSpace", place: "Berlin", date: "Sep/2024 – Feb/2025" }
          ],
          credits: [
            "Written, Edited & Directed by Nina E. Schönefeld",
            "Director of Photography: Valentin Giebel",
            "Sound & Music: Carlos Pablo Villamizar",
            "Starring: Maria Ivanova / Robert Gründler / Caroline Shepard / Benjamin Haim Shepard / Lea Carrera / Lilian Schulz / Jessica Daxenberger / Manfred Peckl / Violet Green / Sophia Salebia / Emilio Rapanà / Max Holle / Dorothy Shepard / Änni Lee Jones / Barrett Shepard",
            "Curator: Kathrin Becker"
          ]
        },
        {
          type: "work",
          title: "Spectral Lures",
          category: "Audiovisual live performance",
          medium: "Audiovisual live performance · sound design",
          subtitle: "An audiovisual live act by Carlos.exe, the collective of Carlos Serrano and Carlos Villamizar.",
          year: 2025,
          location: "Berlin",
          image: "media/collaborations/spectral-lures/dome-audience.jpg",
          thumb: "media/collaborations/spectral-lures/dome-audience-720.jpg",
          video: {
            src: "media/collaborations/spectral-lures/spectral-lures-alte-muenze.mp4",
            poster: "media/collaborations/spectral-lures/spectral-lures-poster.jpg",
            caption: "Live at Alte Münze, Berlin · Oct 2025"
          },
          // how it is labelled on the home page
          homeTitle: "Spectral Lures by Carlos.exe",
          homeMeta: "Sound design",
          roles: [
            { role: "Concept & visuals", name: "Carlos Serrano", link: "https://cayequitas.com/#p-spectral-lures" },
            { role: "Sound design", name: "Carlos Villamizar" }
          ],
          text: "Spectral Lures is an experimental audiovisual live act exploring the space between illusion, memory and simulation. The act invites audiences to lose orientation and immerse themselves in a world where perception is constantly rewritten, a journey through the shimmering interplay of sound, vision and synthetic imagination. The performance combines electronic sound with visuals generated in real time using advanced 3D software.",
          textNote: "Carlos.exe is an audiovisual collective formed by Carlos Serrano and Carlos Villamizar.",
          tools: "TouchDesigner · Unreal Engine · Ableton Live · Elektron",
          exhibitions: [
            { title: "B-Dome", place: "RAW-Gelände, Berlin", date: "2025" },
            { title: "Alte Münze", place: "Berlin", date: "Oct/2025" }
          ],
          gallery: [
            { src: "media/collaborations/spectral-lures/dome-audience.jpg", caption: "Live in the dome · B-Dome, Berlin" },
            { src: "media/collaborations/spectral-lures/duo-live.jpg", caption: "Carlos.exe live" },
            { src: "media/collaborations/spectral-lures/dome-back-view.jpg", caption: "Under the dome · B-Dome, Berlin" },
            { src: "media/collaborations/spectral-lures/dome-performance.jpg", caption: "Performance · B-Dome, Berlin" },
            { src: "media/collaborations/spectral-lures/still-forest.jpg", caption: "Video still · Alte Münze, Berlin" },
            { src: "media/collaborations/spectral-lures/still-wide.jpg", caption: "Video still · Alte Münze, Berlin" }
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
    },
    {
      id: "initiatives", title: "Initiatives",
      items: [
        {
          type: "work",
          title: "Sonic Inclusion",
          category: "Gallery & laboratory",
          medium: "Gallery & laboratory for sound",
          subtitle: "A Berlin-based gallery and laboratory where art, science and society intersect and are reimagined through sound.",
          year: 2026,
          location: "Berlin",
          image: "media/initiatives/sonic-inclusion/logo-1.jpg",
          logos: [
            "media/initiatives/sonic-inclusion/logo-1.jpg",
            "media/initiatives/sonic-inclusion/logo-2.jpg"
          ],
          imageCaption: "Sonic Inclusion, logo variations",
          // home page tile: white symbol on black, switching like the page
          tileLogos: [
            "media/initiatives/sonic-inclusion/symbol-1-dark.jpg",
            "media/initiatives/sonic-inclusion/symbol-2-dark.jpg"
          ],
          homeTitle: "Sonic Inclusion",
          homeMeta: "Co-founder · Berlin",
          website: { label: "sonicinclusion.com", url: "https://www.sonicinclusion.com" },
          roles: [
            { role: "Co-founders", name: "Kate Andriienko, Carlos Villamizar" }
          ],
          text: "Sonic Inclusion is a Berlin-based gallery and laboratory where art, science and society intersect and are reimagined through sound. Rooted in an antidisciplinary approach, the space invites creators from diverse fields (artists, technologists, scientists, designers, choreographers, writers and more) to collaborate beyond the boundaries of traditional disciplines. Exhibitions function as working labs: live prototypes, visible signal flows, sound pressure logs, captioned audio, spectrograms, tactile interfaces and facilitated feedback. Each show evolves during its run, and every project publishes open methods so others can reuse and build upon the work.",
          programme: {
            title: "Signal Cultures",
            intro: "Signal Cultures is the first festival series initiated by Sonic Inclusion, exploring sound as a medium of artistic, technological and social inquiry. Across three editions at independent venues in Berlin, concerts, performances and installations opened a space for exchange between artists, researchers, technologists and a wide audience.",
            events: [
              { title: "Volume I — Electronic ambient concert", people: "Croatian Amor, Nexcyia, Mu_tate, Carlos Villamizar, Èvia", place: "Studio db, Berlin", date: "21.02.2026" },
              { title: "Volume II — Electroacoustic concert", people: "Mazen Kerbaj, Gibrana Cervantes", place: "Morphine Raum, Berlin", date: "12.03.2026" },
              { title: "Volume III — Installation", people: "Interspecifics (Leslie García, Paloma López)", place: "New Fears Gallery, Berlin", date: "17.04.2026" }
            ]
          }
        }
      ]
    }
  ],

  filters: ["Year", "Medium", "Location", "Categories", "Latest"]
};
