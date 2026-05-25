const fs = require('fs');
const { execSync } = require('child_process');

// Use environment variable if provided, fallback to the default render URL
const API_BASE_URL =
  process.env.API_BASE_URL || 'https://api-pingbee.duckdns.org';

async function syncTypes() {
  console.log(`Using API Base URL: ${API_BASE_URL}`);

  // 1. Sync REST API Types
  console.log('\n--- Syncing REST API Types ---');
  try {
    const restCommand = `npx openapi-typescript ${API_BASE_URL}/openapi.json -o src/types/ApiTypes/RestApiTypes/generatedRestApiTypes.ts`;
    execSync(restCommand, { stdio: 'inherit' });
    console.log('Successfully generated REST API types!');
  } catch (error) {
    console.error('Failed to generate REST API types', error);
  }

  // 2. Sync WebSocket Types
  console.log('\n--- Syncing WebSocket Types ---');
  const tempFile = 'temp-openapi.json';
  try {
    console.log('Fetching AsyncAPI schema...');
    const res = await fetch(`${API_BASE_URL}/asyncapi.json`);
    const doc = await res.json();

    console.log('Converting to OpenAPI format for openapi-typescript...');
    const openapi = {
      openapi: '3.0.0',
      info: doc.info,
      paths: {},
      components: doc.components,
    };

    fs.writeFileSync(tempFile, JSON.stringify(openapi, null, 2));

    console.log('Generating WebSocket types...');
    const wsCommand = `npx openapi-typescript ${tempFile} -o src/types/ApiTypes/WsApiTypes/generatedWsApiTypes.ts`;
    execSync(wsCommand, { stdio: 'inherit' });
    console.log('Successfully generated WebSocket types!');
  } catch (error) {
    console.error('Failed to generate WebSocket types', error);
  } finally {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

syncTypes();
