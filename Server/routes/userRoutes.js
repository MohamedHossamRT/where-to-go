// const express = require("express");
// const router = express.Router();
// const userController = require("../controllers/userController");
// const { protect, restrictTo } = require("../middlewares/authMiddleware");

// // User profile routes
// router.get("/me", protect, userController.getMyProfile);
// router.put("/update", protect, userController.updateProfile);

// // Favorites routes
// router
//   .route("/favorites")
//   .get(protect, userController.getFavorites)
//   .post(protect, userController.addFavorite);
// router.delete("/favorites/:listingId", protect, userController.removeFavorite);

// // History routes
// router
//   .route("/history")
//   .post(protect, userController.addToHistory)
//   .delete(protect, userController.clearHistory);

// // Admin Routes
// router
//   .route("/")
//   .get(protect, restrictTo("admin"), userController.getAllUsers)
//   .post(protect, restrictTo("admin"), userController.addUser);

// router
//   .route("/:id")
//   .put(protect, restrictTo("admin"), userController.updateUser)
//   .delete(protect, restrictTo("admin"), userController.deleteUser);

// module.exports = router;


const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// --- 👤 مسارات المستخدمين المحمية (لأي مستخدم مسجل الدخول) ---

// مسار عرض الملف الشخصي الحالي للمستخدم
router.get("/me", protect, userController.getMyProfile);

// مسار تحديث البيانات الشخصية للمستخدم
router.put("/update", protect, userController.updateProfile);

// مسارات المفضلة
router
    .route("/favorites")
    .get(protect, userController.getFavorites)
    .post(protect, userController.addFavorite);
    
// مسار حذف عنصر محدد من المفضلة
router.delete("/favorites/:listingId", protect, userController.removeFavorite);

// مسارات سجل الزيارات
router
    .route("/history")
    .post(protect, userController.addToHistory) 
    .delete(protect, userController.clearHistory);

// -------------------------------------------------------------
// --- 👑 مسارات المسؤول (Admin Routes) ---
// -------------------------------------------------------------

router
    .route("/")
    // GET /api/users: جلب جميع المستخدمين (للمسؤول فقط)
    .get(protect, restrictTo("admin"), userController.getAllUsers)
    // 🔥 تم حذف مسار POST لإضافة مستخدم جديد
    // .post(protect, restrictTo("admin"), userController.addUser);

router
    .route("/:id")
    // PUT /api/users/:id: تحديث بيانات مستخدم محدد (للمسؤول فقط)
    .put(protect, restrictTo("admin"), userController.updateUser)
    // DELETE /api/users/:id: حذف مستخدم محدد (للمسؤول فقط)
    .delete(protect, restrictTo("admin"), userController.deleteUser);

module.exports = router;