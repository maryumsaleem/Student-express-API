const express = require("express");
const router = express.Router();
const path = require("path");
const dotenv = require("dotenv");
//load env vars
dotenv.config({ path: "./config/config.env" });

//-- *********** Import Controller Functions *********** --//
const authController = require("../controllers/authController");
const studentController = require("../controllers/studentController");

router.post("/login", authController.Login);

//! *** Student Routes ***!//
router
  .route("/student")
  .get(studentController.getStudent)
  .post(studentController.addStudent);
router
  .route("/student/:id")
  .get(studentController.singleStudent)
  .patch(
    authController.Protect,
    authController.RestrictTo('admin'),
    studentController.updateStudent
  )
  .delete(
    authController.Protect,
    authController.RestrictTo('admin'),
    studentController.removeStudent
  );

module.exports = router;
