const express = require('express');
const { getFullSadanaTracker, getSadanaTrackerForLast7Days, addOptedSadana, deleteOptedSadana } = require('../../controllers/sadanaTracker.controller');

const router = express.Router();

router.get('/', getFullSadanaTracker);
router.get('/last7days', getSadanaTrackerForLast7Days);
router.post('/', addOptedSadana);
router.delete('/', deleteOptedSadana);

module.exports = router;