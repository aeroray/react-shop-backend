require("dotenv").config()
const express = require("express")
const cors = require("cors")
const app = express()
const connectDB = require("./config/db")

// 解决跨域
app.use(cors({ origin: "https://react-shop-aeroray.netlify.app" }))

// 解析请求体
app.use(express.json())

// 引入路由
const userRoutes = require("./routes/userRoutes")
const orderRoutes = require("./routes/orderRoutes")
const productRoutes = require("./routes/productRoutes")

// 注册路由
app.get("/", (req, res) => res.send("OK!"))
app.use("/api/users", userRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/products", productRoutes)
app.get("/api/config/paypal", (req, res) => res.send(process.env.PAYPAL_CLIENT_ID))

// 错误处理
app.use(require("./middleware/errorHandler")["notFoundHandler"])
app.use(require("./middleware/errorHandler")["errorHandler"])

// 配置端口
const PORT = process.env.PORT || 5000

// 启动函数
const start = async () => {
  // 连接数据库
  await connectDB()
  // 启动服务器
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
}

start()
