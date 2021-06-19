import express from "express";
import Receipts from "../../modals/settings/receipt";
import { uploadImages } from "../fileHandler/uploadFiles";
const router = express.Router();

router.get("/:storeId", async (req, res) => {
  try {
    const { account } = req.authData;
    const { storeId } = req.params;
    const result = await Receipts
      .findOne({ account: account, store: storeId })
      .sort({ _id: "desc" })
      .limit(1); // Find Lasted One Record
    if (result !== null) {
      result.receiptImage =
        result.receiptImage === "null"
          ? ""
          : `media/receipt/${account}/${result.receiptImage}`;
      result.printedReceiptImage =
        result.printedReceiptImage === "null"
          ? ""
          : `media/receipt/${account}/${result.printedReceiptImage}`;
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
      if (files.length !== 0) {
        const Image1 = await uploadImages(files[0], `receipt/${account}`);
        const Image2 = files.length > 1 ? await uploadImages(files[1], `receipt/${account}`) : "";
        const receiptImageName = Image1.images[0]
        const printedReceiptImageName = Image2.images[0]
          newReceipt = await new Receipts({
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
          });
      } else {
        newReceipt = await new Receipts({
          header: header,
          footer: footer,
          show_customer_info: show_customer_info,
          show_comments: show_comments,
          language: language,
          store: storeId,
          createdBy: _id,
          account: account
        });
      }
      const result = await newReceipt.save();
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});


module.exports = router;
