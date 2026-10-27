/*
  RP BROWSER UPDATE DATA
  ----------------------
  Add new entries to the beginning of the RP_UPDATES array.
  Use relative image paths from the repository root, e.g.:
    image: "images/vehicles/new-car.jpg"

  Categories suggested:
  "Vehicles", "Locations", "Jobs", "Missions", "Events",
  "Patch Notes", "Announcements"

  Keep old entries to preserve the version history/archive.
*/
window.RP_UPDATES = [
  {
    id: "welcome-portal",
    title: "Welcome to the City Browser",
    category: "Announcements",
    version: "1.0.0",
    date: "2026-10-27",
    featured: true,
    image: "announcement.png",
    gallery: [],
    summary: "Your official place for roleplay city news, events, locations and game updates.",
    content: [
      "Welcome to the official city information portal.",
      "Check this page for developer-published updates, new locations, vehicles, jobs, missions, events and patch notes.",
      "This is sample content. Replace or remove it when you publish your real game updates."
    ],
    changes: [
      "Introduced the in-game browser portal.",
      "Added search and category filters.",
      "Added update details and version history."
    ],
    eventDate: ""
  },
  {
    id: "sample-location",
    title: "Explore a New Location",
    category: "Locations",
    version: "1.0.0",
    date: "2026-10-27",
    featured: false,
    image: "events.png",
    gallery: [],
    summary: "A sample location update. Replace this text with details about a real area in your RP world.",
    content: [
      "Add the location name, what players can do there, and any roleplay rules or access requirements.",
      "Upload the image to your repository and update the image path above."
    ],
    changes: ["Sample location entry — replace with real information."],
    eventDate: ""
  },
  {
    id: "sample-event",
    title: "Community Event Announcement",
    category: "Events",
    version: "1.0.0",
    date: "2026-10-27",
    featured: false,
    image: "location.png",
    gallery: [],
    summary: "A sample event entry. Add the event schedule, location and participation rules.",
    content: [
      "Event date/time: add your local game schedule here.",
      "Rules: add any participation requirements and event-specific rules."
    ],
    changes: ["Sample event entry — replace with real information."],
    eventDate: "2026-11-01"
  }
];
