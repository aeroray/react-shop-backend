const router = require("express").Router()

const {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
} = require("../controllers/orderController")

const { auth, admin } = require("../middleware/auth")

router.route("/").post(auth, createOrder).get(auth, admin, getAllOrders)

router.get("/myorders", auth, getMyOrders)

router.get("/:id", auth, getOrderById)

router.put("/:id/pay", auth, updateOrderToPaid)

router.put("/:id/deliver", auth, admin, updateOrderToDelivered)

module.exports = router
