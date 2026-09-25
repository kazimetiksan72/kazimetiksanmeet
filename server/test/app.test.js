import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createApp } from '../src/app.js';

const records = [];
const participantModel = {
  async create(participant) {
    if (records.some((record) => record.email === participant.email)) {
      const error = new Error('duplicate key');
      error.code = 11000;
      throw error;
    }
    const created = { _id: String(records.length + 1), ...participant };
    records.push(created);
    return created;
  },
};

let server;
let baseUrl;

before(() => new Promise((resolve) => {
  server = createApp({ participantModel }).listen(0, '127.0.0.1', () => {
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
    resolve();
  });
}));

after(() => new Promise((resolve) => server.close(resolve)));

test('sağlık kontrolü yanıt verir', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('geçerli katılımcıyı normalize ederek kaydeder', async () => {
  const response = await fetch(`${baseUrl}/api/participants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName: '  Ada ', lastName: ' Lovelace ', phone: '+90 555 111 22 33', email: ' ADA@EXAMPLE.COM ' }),
  });
  const body = await response.json();
  assert.equal(response.status, 201);
  assert.equal(body.participant.firstName, 'Ada');
  assert.equal(records[0].email, 'ada@example.com');
});

test('geçersiz alanları reddeder', async () => {
  const response = await fetch(`${baseUrl}/api/participants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName: 'A', lastName: '', phone: '12', email: 'yanlış' }),
  });
  const body = await response.json();
  assert.equal(response.status, 400);
  assert.deepEqual(Object.keys(body.errors).sort(), ['email', 'firstName', 'lastName', 'phone']);
});

test('yinelenen e-postayı anlaşılır yanıtla reddeder', async () => {
  const response = await fetch(`${baseUrl}/api/participants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName: 'Ada', lastName: 'Lovelace', phone: '+90 555 111 22 33', email: 'ada@example.com' }),
  });
  const body = await response.json();
  assert.equal(response.status, 409);
  assert.match(body.message, /daha önce kayıt/);
});
