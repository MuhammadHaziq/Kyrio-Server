import express from "express";
import TimeCard from "../../modals/employee/timeCard";
import {
  removeSpaces,
  removeNumberSpaces,
} from "../../function/validateFunctions";
const ObjectId = require("mongoose").Types.ObjectId;
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    
    var result = await TimeCard.aggregate([
      { $unwind: { path: "$timeDetail", preserveNullAndEmptyArrays: true } },
      { $sort: { "timeDetail._id": -1 } },
      {
        $group: {
          _id: "$_id",
          employee: {
            $first: "$employee",
          },
          store: {
            $first: "$store",
          },
          timeDetail: { $push: "$timeDetail" },
        },
      },
    ]);
    // .find({ created_by: _id }).sort({
    //   "timeDetail.created_at": 1,
    // });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:ids", async (req, res) => {
  try {
    var { ids } = req.params;
    ids = JSON.parse(ids);
    ids.forEach(async (id) => {
      if (ObjectId.isValid(id)) {
        await TimeCard.deleteOne({ _id: id });
      }
    });
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  const {
    store,
    employee,
    clockInDate,
    clockOutDate,
    clockInTime,
    clockOutTime,
  } = req.body;
  var errors = [];
  if (!store || typeof store == "undefined" || store == "") {
    errors.push({ store: "Please Select Store" });
  }
  if (!employee || typeof employee == "undefined" || employee == "") {
    errors.push({ employee: "Please Select Employee" });
  }
  if (!clockInDate || typeof clockInDate == "undefined" || clockInDate == "") {
    errors.push({ clockInDate: "Please Add Clock In Date" });
  }
  if (
    !clockOutDate ||
    typeof clockOutDate == "undefined" ||
    clockOutDate == ""
  ) {
    errors.push({ clockOutDate: "Please Add Clock Out Date" });
  }
  if (!clockInTime || typeof clockInTime == "undefined" || clockInTime == "") {
    errors.push({ clockInTime: "Please Add Clock In Time" });
  }
  if (
    !clockOutTime ||
    typeof clockOutTime == "undefined" ||
    clockOutTime == ""
  ) {
    errors.push({ clockOutTime: "Please Add Clock Out Time" });
  }
  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    const { _id, accountId } = req.authData;
    try {
      const newTimeCard = await new TimeCard({
        store: JSON.parse(store),
        accountId: accountId,
        employee: JSON.parse(employee),
        timeDetail: [
          {
            clockInDate: removeSpaces(clockInDate),
            clockOutDate: removeSpaces(clockOutDate),
            clockInTime: removeSpaces(clockInTime),
            clockOutTime: removeSpaces(clockOutTime),
          },
        ],
        created_by: _id,
      }).save();
      res.status(200).json(newTimeCard);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});

router.patch("/", async (req, res) => {
  const { id, clockInDate, clockOutDate, clockInTime, clockOutTime } = req.body;
  var errors = [];
  if (!clockInDate || typeof clockInDate == "undefined" || clockInDate == "") {
    errors.push({ clockInDate: "Please Add Clock In Date" });
  }
  if (
    !clockOutDate ||
    typeof clockOutDate == "undefined" ||
    clockOutDate == ""
  ) {
    errors.push({ clockOutDate: "Please Add Clock Out Date" });
  }
  if (!clockInTime || typeof clockInTime == "undefined" || clockInTime == "") {
    errors.push({ clockInTime: "Please Add Clock In Time" });
  }
  if (
    !clockOutTime ||
    typeof clockOutTime == "undefined" ||
    clockOutTime == ""
  ) {
    errors.push({ clockOutTime: "Please Add Clock Out Time" });
  }
  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    const { _id } = req.authData;
    try {
      let data = {
        clockInDate: removeSpaces(clockInDate),
        clockOutDate: removeSpaces(clockOutDate),
        clockInTime: removeSpaces(clockInTime),
        clockOutTime: removeSpaces(clockOutTime),
        event: "Edited",
      };
      const result = await TimeCard.updateOne(
        { _id: id },
        { $push: { timeDetail: [data] } }
      );
      if (result.nModified === 1) {
        var result = await TimeCard.aggregate([
          {
            $match: {
              _id: id,
            },
          },
          {
            $unwind: { path: "$timeDetail", preserveNullAndEmptyArrays: true },
          },
          { $sort: { "timeDetail._id": -1 } },
          {
            $group: {
              _id: "$_id",
              employee: {
                $first: "$employee",
              },
              store: {
                $first: "$store",
              },
              timeDetail: { $push: "$timeDetail" },
            },
          },
        ]);
        res.status(200).json(result);
      } else {
        res.status(400).json({ message: "Not Update" });
      }

      // let result = await TimeCard.findOneAndUpdate(
      //   { _id: id },
      //   { $push: { timeDetail: [data] } },
      //   {
      //     new: true,
      //     upsert: false, // Make this update into an upsert
      //     multi: true,
      //   }
      // );
      // res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});

module.exports = router;
