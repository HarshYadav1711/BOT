/**
 * End-to-end smoke against a running Netlify Dev / production Functions host.
 * Usage:
 *   1) netlify dev   (or set E2E_BASE_URL to a deployed site)
 *   2) npm run e2e:netlify
 *
 * Never prints DATABASE_URL, passwords, or session tokens.
 * Cleans up the temporary registration it creates (via admin delete).
 */

import { loadEnvFile } from './loadEnv.mjs';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function parseSetCookie(headerValue) {
  if (!headerValue) return null;
  // Node fetch may join multiple Set-Cookie with comma — take first cookie pair only.
  const first = String(headerValue).split(/,(?=\s*[^;=]+=)/)[0] || String(headerValue);
  const [pair] = first.split(';');
  return pair?.trim() || null;
}

async function readJson(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function main() {
  loadEnvFile();

  const base = (process.env.E2E_BASE_URL || 'http://localhost:8888').replace(/\/$/, '');
  const adminUser =
    process.env.ADMIN_INITIAL_USERNAME?.trim() ||
    process.env.E2E_ADMIN_USERNAME?.trim() ||
    'admin';
  const adminPass =
    process.env.ADMIN_INITIAL_PASSWORD ||
    process.env.E2E_ADMIN_PASSWORD ||
    '';

  if (!adminPass) {
    console.error('e2e:netlify failed: admin password not set in .env (ADMIN_INITIAL_PASSWORD).');
    process.exit(1);
  }

  const stamp = Date.now();
  const roll = `E2E-NETLIFY-${stamp}`;
  let applicationId = null;
  let sessionCookie = null;

  const fn = (name) => `${base}/.netlify/functions/${name}`;

  try {
    // 1) Health
    const healthRes = await fetch(fn('health'));
    const health = await readJson(healthRes);
    assert(healthRes.ok && health?.ok === true, 'health check failed');
    console.log('ok  health');

    // 2) Public register
    const registerRes = await fetch(fn('register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        fullName: 'E2E Netlify Applicant',
        universityRollNo: roll,
        gender: 'Male',
        year: '2nd Year',
        branch: 'Computer Science & Engineering (CSE)',
        whatsappNumber: '9876543210',
        email: `e2e.${stamp}@example.com`,
        primaryDomain: 'Tech & Web Operations',
        roleApplied: 'Web Operations Assistant',
        pastExperience: 'E2E past experience',
        motivation: 'E2E motivation for Cultural Cell',
        wasInPreviousEnigma: false,
      }),
    });
    const registerBody = await readJson(registerRes);
    assert(registerRes.status === 201 && registerBody?.ok === true, 'register failed');
    applicationId = registerBody.registration?.applicationId;
    assert(typeof applicationId === 'string' && applicationId.startsWith('ENIGMA-2025-'), 'bad application id');
    console.log('ok  register');

    // 3) Public status by roll
    const statusRes = await fetch(fn('status'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ identifier: roll }),
    });
    const statusBody = await readJson(statusRes);
    assert(statusRes.ok && statusBody?.ok === true, 'status lookup failed');
    assert(statusBody.registration?.applicationId === applicationId, 'status id mismatch');
    assert(statusBody.registration?.status === 'pending', 'unexpected status');
    assert(statusBody.registration?.adminRemarks === undefined, 'status leaked adminRemarks');
    assert(statusBody.registration?.pastExperience === undefined, 'status leaked pastExperience');
    console.log('ok  status');

    // 4) Admin login → HttpOnly cookie (token must not appear in JSON)
    const loginRes = await fetch(fn('admin-login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username: adminUser, password: adminPass }),
    });
    const loginBody = await readJson(loginRes);
    assert(loginRes.ok && loginBody?.ok === true, 'admin-login failed');
    assert(loginBody.token === undefined, 'login JSON must not include session token');
    const setCookie =
      loginRes.headers.getSetCookie?.()?.[0] ||
      loginRes.headers.get('set-cookie');
    sessionCookie = parseSetCookie(setCookie);
    assert(sessionCookie && sessionCookie.startsWith('ucer_admin_session='), 'missing session cookie');
    // Local HTTP (`netlify dev`) must not set Secure — browsers would drop the cookie.
    if (base.startsWith('http://')) {
      assert(
        !/; *secure/i.test(String(setCookie)),
        'Secure cookie set on HTTP base URL — admin session will fail in browser'
      );
    }
    console.log('ok  admin-login cookie');

    // 5) Admin session
    const sessionRes = await fetch(fn('admin-session'), {
      method: 'GET',
      headers: { Accept: 'application/json', Cookie: sessionCookie },
    });
    const sessionBody = await readJson(sessionRes);
    assert(sessionRes.ok && sessionBody?.ok === true, 'admin-session failed');
    console.log('ok  admin-session');

    // 6) Admin list includes our applicant
    const listRes = await fetch(fn('admin-registrations'), {
      method: 'GET',
      headers: { Accept: 'application/json', Cookie: sessionCookie },
    });
    const listBody = await readJson(listRes);
    assert(listRes.ok && listBody?.ok === true && Array.isArray(listBody.registrations), 'admin-registrations failed');
    assert(
      listBody.registrations.some((r) => r.applicationId === applicationId),
      'registered applicant missing from admin list'
    );
    console.log('ok  admin-registrations');

    // 7) Status mutation
    const mutRes = await fetch(fn('admin-registration-status'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ applicationId, status: 'shortlisted' }),
    });
    const mutBody = await readJson(mutRes);
    assert(mutRes.ok && mutBody?.registration?.status === 'shortlisted', 'status mutation failed');
    console.log('ok  admin status update');

    // 8) Status reflects admin change
    const status2Res = await fetch(fn('status'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ identifier: applicationId }),
    });
    const status2Body = await readJson(status2Res);
    assert(status2Body?.registration?.status === 'shortlisted', 'public status did not reflect admin update');
    console.log('ok  cross-device status sync');

    // 9) Unauthorized mutation without cookie
    const unauthRes = await fetch(fn('admin-registration-status'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ applicationId, status: 'rejected' }),
    });
    assert(unauthRes.status === 401, 'admin mutation must require session');
    console.log('ok  unauthorized blocked');

    console.log('e2e:netlify completed successfully.');
  } catch (err) {
    console.error(`e2e:netlify failed: ${err instanceof Error ? err.message : 'unknown'}`);
    process.exitCode = 1;
  } finally {
    // Cleanup temporary registration if we have a session.
    if (applicationId && sessionCookie) {
      try {
        await fetch(fn('admin-registration-delete'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Cookie: sessionCookie,
          },
          body: JSON.stringify({ applicationId }),
        });
        console.log('ok  cleanup');
      } catch {
        console.error('e2e:netlify warning: cleanup delete failed — remove E2E-NETLIFY-* row manually if needed');
      }
    }
  }
}

main();
