const Student = require("../models/Student");

const mongoose = require("mongoose");

module.exports = {
  /*** Add Student to Database ***/
  addStudent: async (req, res) => {
    try {
      const { name, email, rollno, password, role } = req.body;
      let data = { name, email, rollno, password, role };
      const student = await Student.create(data);
      res.status(201).json({ status: "success", data: { student } });
    } catch (error) {
      res.status(400).json({ status: "fail", message: error.message });
    }
  },

  /*** Get Student  from Database ***/
  getStudent: async (req, res) => {
    try {
      // Filteration
      let queryObj = { ...req.query };
      let excludedFields = ["page", "limit", "sort", "fields"];
      excludedFields.forEach((field) => delete queryObj[field]);

      // Advance Filtering
      let queryStr = JSON.stringify(queryObj);
      // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
      console.log(JSON.parse(queryStr));

      let query = Student.find(JSON.parse(queryStr));

      // Sorting
      if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        query = query.sort(sortBy);
      } else {
        query = query.sort("-createdAt");
      }

      //Fields Limiting

      if (req.query.fields) {
        const fields = req.query.fields.split(",").join(" ");
        query = query.select(fields);
      } else {
        query = query.select("-__v");
      }

      //Pagination
      const page = req.query.page * 1 || 1;
      const limit = req.query.limit * 1 || 10;
      const skip = (page - 1) * limit;

      query = query.skip(skip).limit(limit);

      if (req.query.page) {
        const data = await Student.countDocuments();
        if (skip >= data) throw new Error("This page does not exist");
      }
      // Execute the Query
      const students = await query;

      res.status(200).json({
        status: "success",
        results: students.length,
        data: {
          students,
        },
      });
    } catch (err) {
      res.status(401).json({ status: "fail", message: err.message });
    }
  },

  /*** get a student  ***/
  singleStudent: async (req, res) => {
    try {
      const student = await Student.findById(req.params.id).select("-password");
      res.status(200).json({
        status: "success",
        data: {
          student,
        },
      });
    } catch (err) {
      res.status(401).json({ status: "fail", message: err.message });
    }
  },

  /*** update a student  ***/
  updateStudent: async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    const student = await Student.findByIdAndUpdate(id, data, { new: true }).select("-password");
    try {
      res.status(200).json({
        status: "success",
        data: student,
      });
    } catch (err) {
      res.status(400).json({
        status: "failed",
        message: err.message,
      });
    }
  },

  removeStudent: async (req, res) => {
    const id = req.params.id;
    const student = await Student.findByIdAndDelete(id);
    try {
      res.status(200).json({
        status: "success",
        data: null,
      });
    } catch (err) {
      res.status(400).json({
        status: "failed",
        message: err.message,
      });
    }
  },
};
