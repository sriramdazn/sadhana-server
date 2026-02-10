const express = require('express');
const { getFullSadanaTracker, getSadanaTrackerForLast7Days, addOptedSadana, deleteOptedSadana } = require('../../controllers/sadana-tracker.controller');

const router = express.Router();

router.get('/', getFullSadanaTracker);
router.get('/lastSevenDays', getSadanaTrackerForLast7Days);
router.post('/', addOptedSadana);
router.delete('/', deleteOptedSadana);

module.exports = router;