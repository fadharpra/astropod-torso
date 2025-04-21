CREATE TABLE IF NOT EXISTS Episode (
  episodeSlug TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS Person (
  id TEXT PRIMARY KEY,
  img TEXT,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS HostOrGuest (
  episodeSlug TEXT NOT NULL,
  isHost BOOLEAN NOT NULL,
  personId TEXT NOT NULL,
  UNIQUE (episodeSlug, personId),
  FOREIGN KEY (episodeSlug) REFERENCES Episode(episodeSlug),
  FOREIGN KEY (personId) REFERENCES Person(id)
);

CREATE TABLE IF NOT EXISTS Sponsor (
  id TEXT PRIMARY KEY,
  img TEXT,
  name TEXT NOT NULL,
  url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS SponsorForEpisode (
  episodeSlug TEXT NOT NULL,
  sponsorId TEXT NOT NULL,
  UNIQUE (episodeSlug, sponsorId),
  FOREIGN KEY (episodeSlug) REFERENCES Episode(episodeSlug),
  FOREIGN KEY (sponsorId) REFERENCES Sponsor(id)
);
