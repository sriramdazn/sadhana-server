const express = require('express');
const sadanaTracker = require('../../controllers/sadana-tracker.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.use(auth());

router
  .route('/')
  .get(sadanaTracker.getFullSadanaTracker)
  .post(sadanaTracker.addOptedSadana)
  .delete(sadanaTracker.deleteOptedSadana);

module.exports = router;
