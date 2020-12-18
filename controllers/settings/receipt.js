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
  let { receiptImagePath, printedReceiptImagePath } = req.body;
  const { _id, accountId } = req.authData;
  var errors = [];
  var receiptImage = req.files ? req.files.receiptImage : "";
  var printedReceiptImage = req.files ? req.files.printedReceiptImage : "";

  if (
    (!receiptImage ||
      typeof receiptImage == "undefined" ||
      receiptImage == "") &&
    receiptImagePath == ""
  ) {
    errors.push(`Invalid Receipt Image!`);
    // errors.push({ name: `Invalid Name!` });
  }
  if (
    (!printedReceiptImage ||
      typeof printedReceiptImage == "undefined" ||
      printedReceiptImage == "") &&
    printedReceiptImagePath == ""
  ) {
    errors.push(`Invalid Printed Receipt Image!`);
    // errors.push({ name: `Invalid Name!` });
  }
  // if (!header || typeof header == "undefined" || header == "") {
  //   errors.push(`Invalid Header!`);
  // }
  // if (!footer || typeof footer == "undefined" || footer == "") {
  //   errors.push(`Invalid Footer!`);
  // }
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
      let files = [];
      let fileExist = [];
      let newReceipt;
      if (
        receiptImage &&
        typeof receiptImage !== "undefined" &&
        receiptImage !== ""
      ) {
        files.push(receiptImage);
        fileExist.push(true);
      } else {
        fileExist.push(false);
      }
      if (
        printedReceiptImage &&
        typeof printedReceiptImage !== "undefined" &&
        printedReceiptImage !== ""
      ) {
        files.push(printedReceiptImage);
        fileExist.push(true);
      } else {
        fileExist.push(false);
      }
      receiptImagePath === ""
        ? ""
        : (receiptImagePath = receiptImagePath.substring(
            receiptImagePath.lastIndexOf("/") + 1,
            receiptImagePath.length
          ));
      printedReceiptImagePath === ""
        ? ""
        : (printedReceiptImagePath = printedReceiptImagePath.substring(
            printedReceiptImagePath.lastIndexOf("/") + 1,
            printedReceiptImagePath.length
          ));
      // const files = [receiptImage, printedReceiptImage];
      if (files.length !== 0) {
        const imagesName = await uploadImages(files, `receipt/${storeId}`);
        if (imagesName.success === true) {
          newReceipt = new receipts({
            receiptImage:
              fileExist[0] == true ? imagesName.images[0] : receiptImagePath,
            printedReceiptImage:
              fileExist[1] == true
                ? imagesName.images[1]
                : printedReceiptImagePath,
            header: header,
            footer: footer,
            show_customer_info: show_customer_info,
            show_comments: show_comments,
            language: language,
            storeId: storeId,
            createdBy: _id,
            accountId: accountId
          });
        } else {
          res.status(400).send({
            message: `Images Not Saved!`,
            errors: [],
            files,
            fileExist,
          });
        }
      } else {
        newReceipt = new receipts({
          receiptImage: receiptImagePath,
          printedReceiptImage: printedReceiptImagePath,
          header: header,
          footer: footer,
          show_customer_info: show_customer_info,
          show_comments: show_comments,
          language: language,
          storeId: storeId,
          createdBy: _id,
          accountId: accountId
        });
      }
      const result = await newReceipt.save();
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});
router.get("/:storeId", async (req, res) => {
  try {
    var rootDir = process.cwd();
    const { _id, accountId } = req.authData;
    const { storeId } = req.params;
    const result = await receipts
      .findOne({ accountId: accountId, storeId: storeId })
      .sort({ _id: "desc" })
      .limit(1); // Find Lasted One Record
    if (result !== null) {
      result.receiptImage =
        result.receiptImage === "null"
          ? ""
          : `media/receipt/${storeId}/${result.receiptImage}`;
      result.printedReceiptImage =
        result.printedReceiptImage === "null"
          ? ""
          : `media/receipt/${storeId}/${result.printedReceiptImage}`;
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
