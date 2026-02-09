const express = require('express');
const { listSadanas, addSadana, deleteSadanas } = require('../../controllers/sadana.controller');

const router = express.Router();

router.get('/', listSadanas);

router.post('/', addSadana);

router.delete('/', deleteSadanas);

module.exports = router;
