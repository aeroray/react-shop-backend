exports.notFoundHandler = (req, res, next) => {
  const error = new Error("お探しのページは存在しません。")
  res.status(404)
  next(error)
}

exports.errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode).json({ message: err.message })
}
