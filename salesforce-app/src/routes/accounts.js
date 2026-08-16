const express = require('express');
const { withConnection } = require('../salesforce');

const router = express.Router();

// GET /accounts - fetch a page of accounts
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(req.query.pageSize, 10) || 10)
    );
    const offset = (page - 1) * pageSize;

    const [countResult, pageResult] = await withConnection((conn) =>
      Promise.all([
        conn.query('SELECT COUNT() FROM Account'),
        conn.query(
          `SELECT Id, Name, Industry, Phone, Website, BillingCity, BillingCountry FROM Account ORDER BY Name LIMIT ${pageSize} OFFSET ${offset}`
        ),
      ])
    );

    res.json({
      records: pageResult.records,
      page,
      pageSize,
      totalSize: countResult.totalSize,
      totalPages: Math.max(1, Math.ceil(countResult.totalSize / pageSize)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /accounts - create a new account
router.post('/', async (req, res) => {
  try {
    const result = await withConnection((conn) =>
      conn.sobject('Account').create(req.body)
    );
    if (!result.success) {
      return res.status(400).json({ errors: result.errors });
    }
    res.status(201).json({ id: result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
