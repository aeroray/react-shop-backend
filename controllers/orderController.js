const Order = require("../models/Order")

// 处理异步请求错误
const handler = require("express-async-handler")

/**
 * @description 创建新订单
 * @method POST /api/orders
 * ! @access Private
 */
exports.createOrder = handler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body
  if (orderItems && orderItems.length === 0) {
    res.status(400)
    throw new Error("注文は無効です。")
  } else {
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    })
    const createdOrder = await order.save()
    res.status(201).json({ orderId: createdOrder._id })
  }
})

/**
 * @description 通过 ID 获取订单
 * @method GET /api/orders/:id
 * ! @access Private
 */
exports.getOrderById = handler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email")
  if (order) {
    res.json(order)
  } else {
    res.status(404)
    throw new Error("注文が見つかりませんでした。")
  }
})

/**
 * @description 获取当前已登录用户的所有订单
 * @method GET /api/orders/myorders
 * ! @access Private
 */
exports.getMyOrders = handler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
  if (orders) {
    res.json(orders)
  } else {
    res.status(404)
    throw new Error("注文が見つかりませんでした。")
  }
})

/**
 * @description 管理员获取所有订单
 * @method GET /api/orders
 * ! @access Admin Only
 */
exports.getAllOrders = handler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "id name")
  res.json(orders)
})

/**
 * @description 更新订单支付状态
 * @method PUT /api/orders/:id/pay
 * ! @access Private
 */
exports.updateOrderToPaid = handler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (order) {
    order.isPaid = true
    order.paidAt = Date.now()
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    }
    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } else {
    res.status(404)
    throw new Error("注文が見つかりませんでした。")
  }
})

/**
 * @description 管理员更新订单发送状态
 * @method PUT /api/orders/:id/deliver
 * ! @access Admin Only
 */
exports.updateOrderToDelivered = handler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (order) {
    order.isDelivered = true
    order.deliveredAt = Date.now()
    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } else {
    res.status(404)
    throw new Error("注文が見つかりませんでした。")
  }
})
