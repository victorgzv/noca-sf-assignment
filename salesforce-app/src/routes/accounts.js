const express = require('express');
const { getConnection } = require('../salesforce');

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
    const search = (req.query.search || '').trim();
    const conditions = search ? { Name: { $like: `%${search}%` } } : {};
    const fields = ['Id', 'Name', 'Industry', 'Phone', 'Website', 'BillingCity', 'BillingCountry'];

    const conn = await getConnection();
    const [totalSize, records] = await Promise.all([
      conn.sobject('Account').count(conditions),
      conn
        .sobject('Account')
        .find(conditions, fields, { sort: 'Name', limit: pageSize, offset }),
    ]);

    res.json({
      records,
      page,
      pageSize,
      totalSize,
      totalPages: Math.max(1, Math.ceil(totalSize / pageSize)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /accounts - create a new account
router.post('/', async (req, res) => {
  try {
    const conn = await getConnection();
    const result = await conn.sobject('Account').create(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.errors });
    }
    res.status(201).json({ id: result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
