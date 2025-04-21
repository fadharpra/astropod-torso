// db/seed-turso.ts
import { createClient } from '@libsql/client';
import people from './data/people';
import peoplePerEpisode from './data/people-per-episode';
import sponsors from './data/sponsors';
import sponsorsPerEpisode from './data/sponsors-per-episode';
import { getAllEpisodes } from '../src/lib/rss';

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  console.error('❌ Missing Turso environment variables.');
  process.exit(1);
}

const db = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

async function seed() {
  const episodes = await getAllEpisodes();

  for (const ep of episodes) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO Episode (episodeSlug) VALUES (?)',
      args: [ep.episodeSlug],
    });
  }

  for (const person of people) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO Person (id, name, img) VALUES (?, ?, ?)',
      args: [person.id, person.name, person.img ?? null],
    });
  }

  for (const [episodeSlug, guests] of Object.entries(peoplePerEpisode)) {
    for (const person of guests) {
      await db.execute({
        sql: 'INSERT OR IGNORE INTO HostOrGuest (episodeSlug, personId, isHost) VALUES (?, ?, ?)',
        args: [episodeSlug, person.id, person.host ?? false],
      });
    }
  }

  for (const sponsor of sponsors) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO Sponsor (id, name, img, url) VALUES (?, ?, ?, ?)',
      args: [sponsor.id, sponsor.name, sponsor.img ?? null, sponsor.url ?? null],
    });
  }

  for (const [episodeSlug, episodeSponsors] of Object.entries(sponsorsPerEpisode)) {
    for (const s of episodeSponsors) {
      await db.execute({
        sql: 'INSERT OR IGNORE INTO SponsorForEpisode (episodeSlug, sponsorId) VALUES (?, ?)',
        args: [episodeSlug, s.id],
      });
    }
  }

  console.log('🌱 Done seeding Turso!');
}

seed().catch((err) => {
  console.error('❌ Failed to seed:', err);
  process.exit(1);
});
