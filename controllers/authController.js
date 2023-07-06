const Student = require("../models/Student");
const dotenv = require("dotenv");
//load env vars
dotenv.config({ path: "./config/config.env" });
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
let login_token = "student-json-login-token";
const util = require("util");
/*** Login  function for existing User***/
exports.Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(email,password);
    if (!email || !password) {
      return res.status(400).json({
        status: "failed",
        message: err.message,
      });
    }
    let user = await Student.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({
        status: "failed",
        message: err.message,
      });
    }
    console.log(user);
    let comp = await bcrypt.compare(req.body.password, user.password);
    if (!comp) {
      return res
        .status(401)
        .send({ message: err.message });
    }
    let token = jwt.sign({ id: user._id }, login_token);
    console.log(token);
    
    res.status(200).json({
      status: "success"
    });
  } catch (err) {
    res.status(400).json({
      status: "failed djdh",
      message: err.message,
    });
  }
};
/*** Protect Routes against unauthorized users ***/
exports.Protect = async (req, res, next) => {
  try {
    let token = req.headers["authorization"];
    if (token && token.startsWith("Bearer")) {
      token = token.split(" ")[1];
      let decoded = await util.promisify(jwt.verify)(token, login_token);
      let freshUser = await Student.findById(decoded.id);
      //console.log(freshUser);
      if (!freshUser) {
        res
          .status(401)
          .json({
            status: "failed",
            message: err.message,
          });
      }
      req.user = freshUser;
      next();
      // Check whether user has changed password after token issued
    } else {
      res
        .status(403)
        .json({
          status: "failed",
          message: err.message,
        });
    }
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

/*** Restrict Users---> Assigning roles and permissions ***/
exports.RestrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(req.user)
    if (!roles.includes(req.user.role)) {
      return res
        .status(401)
        .json({   status: "failed",
        message: "You are not authorized" });
    }
    next();
  };
};



  