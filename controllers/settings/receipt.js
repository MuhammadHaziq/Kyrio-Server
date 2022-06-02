import express from "express";
import Receipts from "../../modals/settings/receipt";
import { uploadImages } from "../fileHandler/uploadFiles";

const fs = require("fs-extra");
const router = express.Router();

router.get("/:storeId", async (req, res) => {
  try {
    const { account } = req.authData;
    const { storeId } = req.params;
    const result = await Receipts
      .findOne({ account: account, store: storeId })
      .sort({ _id: "desc" })
      .limit(1);
    if (result !== null) {
      if (
        result.receiptImage &&
        typeof result.receiptImage !== "undefined" &&
        result.receiptImage !== ""
      ) {
      result.receiptImage =
        result.receiptImage === "null"
          ? ""
          : `media/receipt/${account}/${result.receiptImage}`;
      } else {
        result.receiptImage = ""
      }
      if (
        result.printedReceiptImage &&
        typeof result.printedReceiptImage !== "undefined" &&
        result.printedReceiptImage !== ""
      ) {
      result.printedReceiptImage =
        result.printedReceiptImage === "null"
          ? ""
          : `media/receipt/${account}/${result.printedReceiptImage}`;
      } else {
        result.printedReceiptImage = ""
      }
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/", async (req, res) => {
  const {
    header,
    footer,
    show_customer_info,
    show_comments,
    language,
    storeId,
    receiptImagePath,
    printedReceiptImagePath
  } = req.body;
  const { _id, account } = req.authData;
  var errors = [];
  var receiptImage = req.files ? req.files.receiptImage : "";
  var printedReceiptImage = req.files ? req.files.printedReceiptImage : "";

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
      var receiptImageName = "";
      var printedReceiptImageName = "";
      if (receiptImage) {
       let response = await uploadImages(receiptImage, `receipt/${account}`);
       receiptImageName = response.images.length > 0 ? response.images[0] : ""
      } 
      if(printedReceiptImage) {
        let response = await uploadImages(printedReceiptImage, `receipt/${account}`);
        printedReceiptImageName = response.images.length > 0 ? response.images[0] : ""
      }

      const exist = await Receipts
      .findOne({ account: account, store: storeId })
      if(exist){
        var rootDir = process.cwd();
        if (typeof exist.receiptImage !== "undefined" && exist.receiptImage !== null && exist.receiptImage !== '' && receiptImage) {
          let fileUrl = `${rootDir}/uploads/receipt/${account}/` + exist.receiptImage;
          if (fs.existsSync(fileUrl)) {
            fs.unlinkSync(fileUrl);
          }
        }
        if (typeof exist.printedReceiptImage !== "undefined" && exist.printedReceiptImage !== null && exist.printedReceiptImage !== '' && printedReceiptImage) {
          let fileUrl = `${rootDir}/uploads/receipt/${account}/` + exist.printedReceiptImage;
          if (fs.existsSync(fileUrl)) {
            fs.unlinkSync(fileUrl);
          }
        }
        // If image is deleted
        let existedDeletedReceipt = false
        let existedDeletedPrinter = false
        if (typeof exist.receiptImage !== "undefined" && exist.receiptImage !== null && exist.receiptImage !== '' && !receiptImage && receiptImagePath == 'null' ) {
          let fileUrl = `${rootDir}/uploads/receipt/${account}/` + exist.receiptImage;
          if (fs.existsSync(fileUrl)) {
            fs.unlinkSync(fileUrl);
          }
          existedDeletedReceipt = true
        }
        if (typeof exist.printedReceiptImage !== "undefined" && exist.printedReceiptImage !== null && exist.printedReceiptImage !== '' && !printedReceiptImage && printedReceiptImagePath == 'null') {
          let fileUrl = `${rootDir}/uploads/receipt/${account}/` + exist.printedReceiptImage;
          if (fs.existsSync(fileUrl)) {
            fs.unlinkSync(fileUrl);
          }
          existedDeletedPrinter = true
        }

        const updatedReceipt = await Receipts.findOneAndUpdate(
          { account: account, store: storeId },
          {
            $set: {
              receiptImage: receiptImageName !== "" ? receiptImageName : existedDeletedReceipt ? "" : exist.receiptImage,
              printedReceiptImage: printedReceiptImageName !== "" ? printedReceiptImageName : existedDeletedPrinter ? "" : exist.printedReceiptImage,
              header: header,
              footer: footer,
              show_customer_info: show_customer_info,
              show_comments: show_comments,
              language: language,
              store: storeId,
              createdBy: _id,
              account: account
            },
          },
          {
            new: true,
            upsert: true, // Make this update into an upsert
          }
        )
        res.status(200).json(updatedReceipt);
      } else {
        const newReceipt = await new Receipts({
          receiptImage: receiptImageName,
          printedReceiptImage: printedReceiptImageName,
          header: header,
          footer: footer,
          show_customer_info: show_customer_info,
          show_comments: show_comments,
          language: language,
          store: storeId,
          createdBy: _id,
          account: account
        }).save();
        res.status(200).json(newReceipt);
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});


module.exports = router;
