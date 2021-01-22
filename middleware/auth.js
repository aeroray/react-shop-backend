const jwt = require("jsonwebtoken")

// 处理异步请求错误
const handler = require("express-async-handler")

const User = require("../models/User")

exports.auth = handler(async (req, res, next) => {
  let token
  const authorization = req.headers.authorization
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      token = authorization.split(" ")[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select("-password")
      next()
    } catch (error) {
      res.status(401)
      throw new Error("トークンが確認できませんでした。")
    }
  }
  if (!token) {
    res.status(401)
    throw new Error("認証トークンが必要です。")
  }
})

exports.admin = handler(async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next()
  } else {
    res.status(401)
    throw new Error("アクセス権限の無いアカウントです。")
  }
})
