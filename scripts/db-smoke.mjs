/**
 * Optional runtime smoke checks against a real PostgreSQL database.
 * Usage: npm run db:smoke
 *
 * Requires DATABASE_URL. Does not invent credentials.
 * Never prints DATABASE_URL or credentials.
 * Cleans up rows it creates (SMOKE-TEST-* roll numbers).
 */

import pg from 'pg';
import { buildPoolConfig, loadEnvFile } from './loadEnv.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  loadEnvFile();
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    console.error('db:smoke failed: DATABASE_URL is not set.');
    process.exit(1);
  }

  const pool = new pg.Pool(buildPoolConfig(connectionString));
  const client = await pool.connect();
  const stamp = Date.now();
  const rollA = `SMOKE-TEST-${stamp}-A`;
  const rollB = `SMOKE-TEST-${stamp}-B`;
  const appId = `ENIGMA-2025-V${String(stamp).slice(-4).padStart(4, '0')}`;

  try {
    // 1) Connectivity (health-equivalent)
    const ping = await client.query('SELECT 1 AS ok');
    assert(ping.rows[0]?.ok === 1, 'Connectivity check failed');
    console.log('ok  connectivity');

    // 2) Migration tracking + registrations table
    const tableCheck = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename IN ('registrations', 'schema_migrations')
    `);
    const names = new Set(tableCheck.rows.map((r) => r.tablename));
    assert(names.has('registrations'), 'registrations table missing — run npm run db:migrate');
    assert(names.has('schema_migrations'), 'schema_migrations table missing — run npm run db:migrate');
    console.log('ok  tables present');

    // 3) Constraints
    const constraints = await client.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'public.registrations'::regclass
    `);
    const cons = new Set(constraints.rows.map((r) => r.conname));
    assert(cons.has('registrations_application_id_unique'), 'missing application_id unique');
    assert(cons.has('registrations_roll_year_unique'), 'missing roll+year unique');
    console.log('ok  unique constraints');

    // 4) Insert
    await client.query(
      `
      INSERT INTO registrations (
        application_id, recruitment_year,
        university_roll_no, university_roll_no_normalized,
        full_name, gender, year, branch, whatsapp_number, email,
        primary_domain, role_applied, past_experience, motivation,
        was_in_previous_enigma, status
      ) VALUES (
        $1, 2025,
        $2, $3,
        'Smoke Test User', 'Male', '2nd Year',
        'Computer Science & Engineering (CSE)',
        '9876543210', 'smoke@example.com',
        'Tech & Web Operations', 'Web Operations Assistant',
        'Smoke past experience', 'Smoke motivation',
        FALSE, 'pending'
      )
      `,
      [appId, rollA, rollA]
    );
    console.log('ok  insert');

    // 5) Duplicate roll protection
    let duplicateBlocked = false;
    try {
      await client.query(
        `
        INSERT INTO registrations (
          application_id, recruitment_year,
          university_roll_no, university_roll_no_normalized,
          full_name, gender, year, branch, whatsapp_number, email,
          primary_domain, role_applied, past_experience, motivation,
          was_in_previous_enigma, status
        ) VALUES (
          $1, 2025,
          $2, $3,
          'Smoke Dup', 'Female', '2nd Year',
          'Information Technology (IT)',
          '9123456789', 'smoke2@example.com',
          'Media & Photography', 'Event Photographer',
          'x', 'y', FALSE, 'pending'
        )
        `,
        [`ENIGMA-2025-V9999`, rollA.toLowerCase(), rollA]
      );
    } catch (err) {
      duplicateBlocked = err && err.code === '23505';
    }
    assert(duplicateBlocked, 'duplicate roll was not rejected by DB');
    console.log('ok  duplicate roll blocked');

    // 6) Application ID uniqueness
    let idCollisionBlocked = false;
    try {
      await client.query(
        `
        INSERT INTO registrations (
          application_id, recruitment_year,
          university_roll_no, university_roll_no_normalized,
          full_name, gender, year, branch, whatsapp_number, email,
          primary_domain, role_applied, past_experience, motivation,
          was_in_previous_enigma, status
        ) VALUES (
          $1, 2025,
          $2, $3,
          'Smoke ID Coll', 'Male', '3rd Year',
          'Electronics & Communication (ECE)',
          '9988776655', 'smoke3@example.com',
          'Media & Photography', 'Media Head',
          'x', 'y', FALSE, 'pending'
        )
        `,
        [appId, rollB, rollB]
      );
    } catch (err) {
      idCollisionBlocked = err && err.code === '23505';
    }
    assert(idCollisionBlocked, 'duplicate application_id was not rejected by DB');
    console.log('ok  application_id unique');

    // 7) Lookups
    const byApp = await client.query(
      `SELECT application_id, status FROM registrations WHERE application_id = $1`,
      [appId]
    );
    assert(byApp.rows.length === 1, 'lookup by application_id failed');

    const byRoll = await client.query(
      `
      SELECT application_id
      FROM registrations
      WHERE university_roll_no_normalized = $1 AND recruitment_year = 2025
      `,
      [rollA]
    );
    assert(byRoll.rows.length === 1, 'lookup by roll failed');
    console.log('ok  lookups');

    // 8) Status update
    const updated = await client.query(
      `
      UPDATE registrations
      SET status = 'shortlisted', updated_at = NOW()
      WHERE application_id = $1
      RETURNING status
      `,
      [appId]
    );
    assert(updated.rows[0]?.status === 'shortlisted', 'status update failed');
    console.log('ok  status update');

    // 9) Interview update
    const interview = await client.query(
      `
      UPDATE registrations
      SET
        status = 'interview_scheduled',
        interview_date = '2025-10-20',
        interview_time = '11:00 AM',
        interview_venue = 'UCER Auditorium',
        interview_scheduled_at = NOW(),
        updated_at = NOW()
      WHERE application_id = $1
      RETURNING status, interview_date
      `,
      [appId]
    );
    assert(
      interview.rows[0]?.status === 'interview_scheduled' &&
        interview.rows[0]?.interview_date === '2025-10-20',
      'interview update failed'
    );
    console.log('ok  interview update');

    console.log('db:smoke completed successfully.');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown smoke error';
    console.error(`db:smoke failed: ${message}`);
    process.exitCode = 1;
  } finally {
    try {
      await client.query(
        `DELETE FROM registrations WHERE university_roll_no_normalized LIKE 'SMOKE-TEST-%'`
      );
    } catch {
      // best-effort cleanup
    }
    client.release();
    await pool.end();
  }
}

main();
