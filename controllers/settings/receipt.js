import express from "express";
import receipts from "../../modals/settings/receipt";
import { uploadImages } from "../fileHandler/uploadFiles";
const router = express.Router();

router.post("/", async (req, res) => {
  const {
    header,
    footer,
    show_customer_info,
    show_comments,
    language,
    storeId,
  } = req.body;
  const { _id } = req.authData;
  var errors = [];
  var receiptImage = req.files ? req.files.receiptImage : "";
  var printedReceiptImage = req.files ? req.files.printedReceiptImage : "";

  // if (
  //   !receiptImage ||
  //   typeof receiptImage == "undefined" ||
  //   receiptImage == ""
  // ) {
  //   errors.push(`Invalid Receipt Image!`);
  //   // errors.push({ name: `Invalid Name!` });
  // }
  // if (
  //   !printedReceiptImage ||
  //   typeof printedReceiptImage == "undefined" ||
  //   printedReceiptImage == ""
  // ) {
  //   errors.push(`Invalid Printed Receipt Image!`);
  //   // errors.push({ name: `Invalid Name!` });
  // }
  if (!header || typeof header == "undefined" || header == "") {
    errors.push(`Invalid Header!`);
  }
  if (!footer || typeof footer == "undefined" || footer == "") {
    errors.push(`Invalid Footer!`);
  }
  if (!language || typeof language == "undefined" || language == "") {
    errors.push(`Invalid Language!`);
  }
  if (!storeId || typeof storeId == "undefined" || storeId == "") {
    errors.push(`Invalid Store Id!`);
  }
  if (errors.length > 0) {
    res.status(400).send({ message: `Invalid Parameters!`, errors });
  } else {
    try {
      const files = [receiptImage, printedReceiptImage];
      const imagesName = await uploadImages(files, storeId);
      // res.json({
      //   receiptImage: imagesName.images[0],
      //   printedReceiptImage: imagesName.images[1],
      //   header: header,
      //   footer: footer,
      //   show_customer_info: show_customer_info,
      //   show_comments: show_comments,
      //   language: language,
      //   storeId: storeId,
      //   createdBy: _id,
      // });
      if (imagesName.success === true) {
        const newReceipt = new receipts({
          receiptImage: imagesName.images[0],
          printedReceiptImage: imagesName.images[1],
          header: header,
          footer: footer,
          show_customer_info: show_customer_info,
          show_comments: show_comments,
          language: language,
          storeId: storeId,
          createdBy: _id,
        });
        const result = await newReceipt.save();
        res.status(201).json(result);
      } else {
        res.status(400).send({ message: `Images Not Saved!`, errors: [] });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});
router.get("/:storeId", async (req, res) => {
  try {
    const { _id } = req.authData;
    const { storeId } = req.params;
    const result = await receipts
      .findOne({ createdBy: _id, storeId: storeId })
      .sort({ _id: "desc" })
      .limit(1); // Find Lasted One Record
    const data = {
      status: true,
      data: result !== null ? result["amount"] : "00.0",
    };
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
