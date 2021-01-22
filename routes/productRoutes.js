const router = require("express").Router()

const {
  getProduct,
  getAllProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  createReview,
  getTopRatedProducts,
} = require("../controllers/productController")

const { auth, admin } = require("../middleware/auth")

router.route("/").get(getAllProducts).post(auth, admin, createProduct)

router.get("/top", getTopRatedProducts)

router.route("/:id").get(getProduct).delete(auth, admin, deleteProduct).put(auth, admin, updateProduct)

router.post("/:id/review", auth, createReview)

module.exports = router
