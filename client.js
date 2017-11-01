const { Client } = require('pg');

const DEBUG = process.env.DEBUG;
const ROWS = parseInt(process.env.ROWS) || 100;
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 10;

const c = new Client();
const startTime = Date.now();

const insert = function(startIndex = 0, remainingRows = ROWS) {
  const values = Array(BATCH_SIZE)
      .fill(0) // or else map won't work
      .map((_, i) => `(${i + startIndex})`)
      .join(',');
  const query = `INSERT INTO testtable (id) VALUES ${values}`;
  const queryStart = Date.now();
  return c.query(query).then(() => {
    DEBUG && console.log(`${query} (${Date.now() - queryStart}ms)`);
    if (remainingRows == 0) return;
    return insert(startIndex + BATCH_SIZE, remainingRows - BATCH_SIZE);
  });
}

console.log(`ROWS: ${ROWS}, BATCH_SIZE: ${BATCH_SIZE}`);
DEBUG || console.log('Run with DEBUG=1 to see debug output.');

c.connect().catch((e) => {
  if (e.routine != 'auth_failed') throw e;
  const {PGUSER, PGPASSWORD, PGDATABASE} = process.env;
  console.error(`Check your credentials: PGUSER: ${PGUSER}, PGPASSWORD: ${PGPASSWORD}, PGDATABASE: ${PGDATABASE}.`);
  c.end();
  process.exit();
}).then(() => {
  DEBUG && console.log('Connected');
  return c.query('CREATE TABLE IF NOT EXISTS testtable (id int)');
}).then(() => {
  return insert();
}).catch((e) => {
  console.error('Some query failed:');
  console.error(e);
  c.end();
  process.exit();
}).then(() => {
  const time = Date.now() - startTime;
  console.log(`Inserted ${ROWS} with batch size ${BATCH_SIZE} ${time}ms at ${time / ROWS}ms per row.`);
  c.end();
});
