pg-throughput-test
==================

```
npm install
ROWS=1000000 BATCH_SIZE=10000 PGUSER=yourusername PGPASSWORD=yourpassword PGDATABASE=yourdb node client.js
```

You can also add `DEBUG=1` to see batch-by-batch output.

Sample output:

```
ROWS: 1000000, BATCH_SIZE: 10000
Run with DEBUG=1 to see debug output.
Inserted 1000000 with batch size 10000 2968ms at 0.002968ms per row.
```
