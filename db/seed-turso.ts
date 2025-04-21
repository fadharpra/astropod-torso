// db/seed-turso.ts
import { createClient } from '@libsql/client';
import people from './data/people';
import peoplePerEpisode from './data/people-per-episode';
import sponsors from './data/sponsors';
import sponsorsPerEpisode from './data/sponsors-per-episode';
import { getAllEpisodes } from '../src/lib/rss';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function seed() {
  const episodes = await getAllEpisodes();

  // Insert episodes
  for (const ep of episodes) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO Episode (episodeSlug) VALUES (?)',
      args: [ep.episodeSlug],
    });
  }

  // Insert people
  for (const person of people) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO Person (id, name, img) VALUES (?, ?, ?)',
      args: [person.id, person.name, person.img || null],
    });
  }

  // Validate and insert HostOrGuest
  const episodeSlugs = new Set(episodes.map((ep) => ep.episodeSlug));
  const personIds = new Set(people.map((p) => p.id));

  for (const [episodeSlug, guests] of Object.entries(peoplePerEpisode)) {
    if (!episodeSlugs.has(episodeSlug)) {
      console.warn(`⚠️ Skipping unknown episodeSlug: ${episodeSlug}`);
      continue;
    }

    for (const person of guests) {
      if (!personIds.has(person.id)) {
        console.warn(`⚠️ Skipping unknown personId: ${person.id} in episode ${episodeSlug}`);
        continue;
      }

      await db.execute({
        sql: 'INSERT OR IGNORE INTO HostOrGuest (episodeSlug, personId, isHost) VALUES (?, ?, ?)',
        args: [episodeSlug, person.id, person.host ?? false],
      });
    }
  }

  // Insert sponsors
  for (const sponsor of sponsors) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO Sponsor (id, name, img, url) VALUES (?, ?, ?, ?)',
      args: [sponsor.id, sponsor.name, sponsor.img || null, sponsor.url || null],
    });
  }

  // Validate and insert SponsorForEpisode
  const sponsorIds = new Set(sponsors.map((s) => s.id));

  for (const [episodeSlug, sponsorsList] of Object.entries(sponsorsPerEpisode)) {
    if (!episodeSlugs.has(episodeSlug)) {
      console.warn(`⚠️ Skipping unknown episodeSlug in sponsorsPerEpisode: ${episodeSlug}`);
      continue;
    }

    for (const sponsor of sponsorsList) {
      if (!sponsorIds.has(sponsor.id)) {
        console.warn(`⚠️ Skipping unknown sponsorId: ${sponsor.id} in episode ${episodeSlug}`);
        continue;
      }

      await db.execute({
        sql: 'INSERT OR IGNORE INTO SponsorForEpisode (episodeSlug, sponsorId) VALUES (?, ?)',
        args: [episodeSlug, sponsor.id],
      });
    }
  }

  console.log('🌱 Done seeding Turso!');
}

seed().catch((err) => {
  console.error('❌ Failed to seed:', err);
  process.exit(1);
});

