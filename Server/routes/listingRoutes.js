const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listingController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// User routes (protected)
router.use(protect);

router.post("/submit", listingController.createListing);
router
  .route("/:id/own")
  .put(listingController.updateOwnListing)
  .delete(listingController.deleteOwnListing);
router.get("/my", listingController.getMyListings);

// Admin-only routes
router.use(restrictTo("admin"));

router
  .route("/")
  .post(listingController.adminCreateListing)
  .get(listingController.getAllListings);

router
  .route("/:id")
  .put(listingController.updateListing) // Update
  .delete(listingController.deleteListing);

router.patch("/:id/status", listingController.updateListingStatus); // Approve / Reject

module.exports = router;
