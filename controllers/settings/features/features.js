import express from "express";
import Users from "../../../modals/users";
import Role from "../../../modals/role";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { _id } = req.authData;
    const { role_id } = req.query;
    if (!role_id || typeof role_id === "undefined" || role_id == "") {
      res.status(400).json({ message: "Role Not Assigned", errors: [] });
    }
    const result = await Role.findOne({ _id: role_id });
    let data = {};
    if (result !== null) {
      data = {
        status: true,
        data: result,
      };
    } else {
      data = {
        status: false,
        data: [],
      };
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/", async (req, res) => {
  try {
    const { _id } = req.authData;
    const { featureId, enable } = req.query;
    if (!featureId || typeof featureId === "undefined" || featureId == "") {
      res.status(400).json({ message: "Feature Id Not Empty", errors: [] });
    }
    await Role.updateOne(
      { features: { $elemMatch: { _id: featureId } } },
      {
        $set: {
          enable: enable,
        },
      }
    );

    res.status(200).json({ message: "Features Updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
