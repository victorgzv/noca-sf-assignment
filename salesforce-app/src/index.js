require('dotenv').config();
const express = require('express');
const accountsRouter = require('./routes/accounts');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/accounts', accountsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
