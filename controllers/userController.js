const User = require("../models/User")

// 处理异步请求错误
const handler = require("express-async-handler")

const { generateToken } = require("../utils/generateToken")

/**
 * @description 验证用户并生成令牌
 * @method POST /api/users/login
 * @access Public
 */
exports.authUser = handler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    })
  } else {
    res.status(401)
    throw new Error("ご登録のメールアドレスとパスワードが一致しません。")
  }
})

/**
 * @description 创建新用户
 * @method POST /api/users
 * @access Public
 */
exports.createUser = handler(async (req, res) => {
  const { name, email, password } = req.body
  const exitUser = await User.findOne({ email })
  if (exitUser) {
    res.status(400)
    throw new Error("このメールアドレスは既に利用されています。")
  }
  const createdUser = await User.create({
    name,
    email,
    password,
  })
  if (createdUser) {
    res.status(201).json({
      _id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      isAdmin: createdUser.isAdmin,
      token: generateToken(createdUser._id),
    })
  } else {
    res.status(400)
    throw new Error("登録できませんでした。")
  }
})

/**
 * @description 管理员获取所有用户
 * @method GET /api/users
 * ! @access Admin Only
 */
exports.getAllUsers = handler(async (req, res) => {
  const users = await User.find({})
  res.json(users)
})

/**
 * @description 管理员根据用户 ID 找到并删除该用户
 * @method DELETE /api/users/:id
 * ! @access Admin Only
 */
exports.deleteUser = handler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (user) {
    await user.remove()
    res.json({ message: "ユーザーを削除しました。" })
  } else {
    res.status(404)
    throw new Error("ユーザーが見つかりませんでした。")
  }
})

/**
 * @description 管理员根据用户 ID 找到并更新该用户的信息
 * @method PUT /api/users/:id
 * ! @access Admin Only
 */
exports.updateUser = handler(async (req, res) => {
  const { email, name, isAdmin } = req.body
  const user = await User.findById(req.params.id)
  if (user) {
    user.name = name || user.name
    user.email = email || user.email
    user.isAdmin = isAdmin
    await user.save()
    res.status(204).json()
  } else {
    res.status(404)
    throw new Error("ユーザーが見つかりませんでした。")
  }
})

/**
 * @description 当前用户更新自己的信息
 * @method PUT /api/users/profile
 * * @access Private
 */
exports.updateUserProfile = handler(async (req, res) => {
  const { email, password, name } = req.body
  const user = await User.findById(req.user._id)
  if (user && (await user.matchPassword(password))) {
    user.name = name
    user.email = email
    const updatedUser = await user.save()
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    })
  } else {
    res.status(404)
    throw new Error("認証できませんでした。")
  }
})
