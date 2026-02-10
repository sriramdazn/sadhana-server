const express = require('express');
const { getFullSadanaTracker, getSadanaTrackerForLast7Days, addOptedSadana, deleteOptedSadana } = require('../../controllers/sadana-tracker.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.use(auth());

router.get('/', getFullSadanaTracker);
router.get('/lastSevenDays', getSadanaTrackerForLast7Days);
router.post('/', addOptedSadana);
router.delete('/', deleteOptedSadana);

module.exports = router;
