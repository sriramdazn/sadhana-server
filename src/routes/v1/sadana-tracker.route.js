const express = require('express');
const { getFullSadanaTracker, addOptedSadana, deleteOptedSadana } = require('../../controllers/sadana-tracker.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.use(auth());

router.get('/', getFullSadanaTracker);
router.post('/', addOptedSadana);
router.delete('/', deleteOptedSadana);

module.exports = router;
