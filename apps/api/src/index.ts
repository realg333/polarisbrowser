import { buildApp } from './app';
import { config } from './config';

async function main() {
  const app = await buildApp();

  try {
    await app.listen({ port: config.port, host: config.host });
    console.log(`Polaris API listening on ${config.apiUrl}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
