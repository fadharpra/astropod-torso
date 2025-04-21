// db.config.mjs
export default {
  client: '@libsql/client',
  config: {
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
};
