const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/review.controller');
const Review = require('../models/Review.model');

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');

router.get(
  '/',
  advancedResults(Review, {
    path: 'bootcamp',
    select: 'name description',
  }),
  reviewController.getReviews
);

router.get('/:id', reviewController.getReview);
router.post(
  '/',
  protect,
  authorize('user', 'admin'),
  reviewController.addReview
);
router.put(
  '/:id',
  protect,
  authorize('user', 'admin'),
  reviewController.updateReview
);
router.delete(
  '/:id',
  protect,
  authorize('user', 'admin'),
  reviewController.deleteReview
);

module.exports = router;
