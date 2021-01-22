const router = require("express").Router()

const {
  authUser,
  getAllUsers,
  createUser,
  updateUserProfile,
  deleteUser,
  updateUser,
} = require("../controllers/userController")

const { auth, admin } = require("../middleware/auth")

router.post("/login", authUser)

router.route("/").post(createUser).get(auth, admin, getAllUsers)

router.put("/profile", auth, updateUserProfile)

router.route("/:id").delete(auth, admin, deleteUser).put(auth, admin, updateUser)

module.exports = router
