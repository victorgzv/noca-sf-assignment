const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const jsforce = require('jsforce');

let connection = null;

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function buildJwtAssertion() {
  const privateKey = fs.readFileSync(
    path.join(__dirname, '..', 'certs', 'server.key')
  );

  const header = base64url(JSON.stringify({ alg: 'RS256' }));
  const claims = base64url(
    JSON.stringify({
      iss: process.env.SF_CLIENT_ID,
      sub: process.env.SF_USERNAME,
      aud: process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
      exp: Math.floor(Date.now() / 1000) + 180,
    })
  );

  const signingInput = `${header}.${claims}`;
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(signingInput)
    .sign(privateKey);

  return `${signingInput}.${base64url(signature)}`;
}

async function getConnection() {
  if (connection && connection.accessToken) {
    return connection;
  }

  const loginUrl = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';
  const assertion = buildJwtAssertion();

  const response = await fetch(`${loginUrl}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || data.error);
  }

  connection = new jsforce.Connection({
    instanceUrl: data.instance_url,
    accessToken: data.access_token,
  });

  return connection;
}

function isInvalidSessionError(err) {
  return (
    err.name === 'INVALID_SESSION_ID' ||
    err.errorCode === 'INVALID_SESSION_ID' ||
    /session expired or invalid/i.test(err.message || '')
  );
}

async function withConnection(fn) {
  const conn = await getConnection();
  try {
    return await fn(conn);
  } catch (err) {
    if (!isInvalidSessionError(err)) {
      throw err;
    }
    connection = null;
    const freshConn = await getConnection();
    return fn(freshConn);
  }
}

module.exports = { getConnection, withConnection };
