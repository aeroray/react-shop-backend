const mongoose = require("mongoose")
const Product = require("../models/Product")

// 处理异步请求错误
const handler = require("express-async-handler")

/**
 * @description 获取所有商品
 * @method GET /api/products
 * @access Public
 */
exports.getAllProducts = handler(async (req, res) => {
  const limit = 8
  const page = Number(req.query.page) || 1
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {}
  const count = await Product.countDocuments(keyword)
  const products = await Product.find(keyword)
    .limit(limit)
    .skip(limit * (page - 1))
  res.json({ products, count })
})

/**
 * @description 获取单件商品
 * @method GET /api/products/:id
 * @access Public
 */
exports.getProduct = handler(async (req, res) => {
  const id = req.params.id
  const isValid = mongoose.Types.ObjectId.isValid(id)
  if (!isValid) {
    res.status(400).json({ message: "正しい商品IDを提供してください。" })
  }
  const product = await Product.findById(id)
  if (product) {
    res.json(product)
  } else {
    res.status(404).json({ message: "お探しの商品は存在しません。" })
  }
})

/**
 * @description 获取评分前三的商品
 * @method GET /api/products/top
 * @access Public
 */
exports.getTopRatedProducts = handler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3)
  res.json(products)
})

/**
 * @description 管理员根据商品 ID 找到并删除该商品
 * @method DELETE /api/products/:id
 * ! @access Admin Only
 */
exports.deleteProduct = handler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (product) {
    await product.remove()
    res.json({ message: "商品を削除しました。" })
  } else {
    res.status(404)
    throw new Error("商品が見つかりませんでした。")
  }
})

/**
 * @description 管理员创建新商品
 * @method POST /api/products
 * ! @access Admin Only
 */
exports.createProduct = handler(async (req, res) => {
  const { name, price, image, category, brand, countInStock, description } = req.body
  const product = new Product({
    name,
    price,
    user: req.user._id,
    image,
    category,
    brand,
    countInStock,
    numReviews: 0,
    description,
  })
  const createdProduct = await product.save()
  if (createdProduct) {
    res.status(201).json(createdProduct)
  } else {
    throw new Error("保存ができませんでした。")
  }
})

/**
 * @description 管理员根据商品 ID 找到并更新该商品
 * @method PUT /api/products/:id
 * ! @access Admin Only
 */
exports.updateProduct = handler(async (req, res) => {
  const { name, price, image, category, brand, countInStock, description } = req.body
  const product = await Product.findById(req.params.id)
  if (product) {
    product.name = name
    product.price = price
    product.image = image
    product.brand = brand
    product.category = category
    product.description = description
    product.countInStock = countInStock
    await product.save()
    res.status(204).json()
  } else {
    res.status(404)
    throw new Error("商品が見つかりませんでした。")
  }
})

/**
 * @description 评价商品
 * @method POST /api/products/:id/review
 * ! @access Private
 */
exports.createReview = handler(async (req, res) => {
  const { rating, comment } = req.body
  const product = await Product.findById(req.params.id)
  if (product) {
    const reviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString())
    if (reviewed) {
      res.status(400)
      throw new Error("既にレビューしました。")
    }
    const review = {
      name: req.user.name,
      rating: Number(rating),
      user: req.user._id,
      comment,
    }
    product.reviews.push(review)
    product.numReviews = product.reviews.length
    product.rating = (product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length).toFixed("1")
    await product.save()
    res.status(201).json()
  } else {
    res.status(404)
    throw new Error("商品が見つかりませんでした。")
  }
})
