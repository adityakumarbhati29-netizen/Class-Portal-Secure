// @ts-nocheck
import app from "./app.js";
import { logger } from "./lib/logger.js";
import { seedIfEmpty } from "./lib/seed.js";

const rawPort = process.env["PORT"] || "3000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
  try {
    await seedIfEmpty();
    logger.info("Database seeded (or already populated)");
  } catch (seedErr) {
    logger.error({ err: seedErr }, "Failed to seed database");
  }
});


