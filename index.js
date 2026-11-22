import { appendFileSync } from 'node:fs';

const payloadRaw = process.env.INPUT_PAYLOAD;
const outputPath = process.env.GITHUB_OUTPUT;

if (typeof payloadRaw !== 'string' || payloadRaw.length === 0) {
  throw new Error('Invalid input');
}
if (typeof outputPath !== 'string' || outputPath.length === 0) {
  throw new Error('Invalid output');
}

let payload;
try {
  payload = JSON.parse(payloadRaw);
} catch {
  throw new Error('Invalid input');
}

if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
  throw new Error('Invalid input');
}
if (!Object.prototype.hasOwnProperty.call(payload, 'value') || !Object.prototype.hasOwnProperty.call(payload, 'path')) {
  throw new Error('Invalid input');
}

const root = payload.value;
const path = payload.path;

if (root === null || typeof root !== 'object' || Array.isArray(root)) {
  throw new Error('Invalid input');
}
if (typeof path !== 'string' || path.length === 0) {
  throw new Error('Invalid input');
}

const segments = path.split('.');
const segRe = /^[A-Za-z0-9_-]+$/;
for (let i = 0; i < segments.length; i++) {
  if (!segRe.test(segments[i])) {
    throw new Error('Invalid input');
  }
}

let current = root;
let exists = true;

for (let i = 0; i < segments.length; i++) {
  if (current === null || typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, segments[i])) {
    exists = false;
    break;
  }
  current = current[segments[i]];
}

const result = exists ? { exists: true, value: current } : { exists: false, value: null };
appendFileSync(outputPath, `result=${JSON.stringify(result)}\n`);