const express = require('express');
const { getConnection } = require('../salesforce');

const router = express.Router();

// GET /accounts - fetch all accounts
router.get('/', async (req, res) => {
  try {
    const conn = await getConnection();
    const result = await conn.query(
      'SELECT Id, Name, Industry, Phone, Website, BillingCity, BillingCountry FROM Account LIMIT 200'
    );
    res.json({ records: result.records, totalSize: result.totalSize });
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
