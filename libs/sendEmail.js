import { receiptTemplate, adminTemplate, userTemplate } from "./emailTemplates";
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
  "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"
);
export const sendEmail = async (emailData) => {
  let adminBody = adminTemplate(emailData.businessName, emailData.email);
  let userBody = userTemplate(emailData._id);
  const userMsg = {
    to: emailData.email,
    from: emailData.from,
    subject: "Welcome To Kyrio POS",
    html: userBody,
  };
  let responseData = "";
  await sgMail.send(userMsg).then(
    (response) => {
      responseData = response;
    },
    (error) => {
      console.error(error.message);

      if (error.response) {
        console.error(error.response.body);
      }
      responseData = error;
    }
  );
  let adminMsg = {
    to: "tahiramjad79@gmail.com",
    from: emailData.from,
    subject: "New User Registered",
    html: adminBody,
  };
  await sgMail.send(adminMsg).then(
    (response) => {
      responseData = response;
    },
    (error) => {
      console.error(error.message);

      if (error.response) {
        console.error(error.response.body);
      }
      responseData = error;
    }
  );
  return responseData;
};

export const sendReceiptEmail = async (email, receipt, store) => {
  let receiptBody = receiptTemplate(receipt);
  const userMsg = {
    to: email,
    from: "receipts@kyrio.com",
    subject: `Receipt from ${store}`,
    html: receiptBody,
  };
  let responseData = "";
  await sgMail.send(userMsg).then(
    (response) => {
      responseData = response;
    },
    (error) => {
      console.error(error.message, "Error");

      if (error.response) {
        console.error(error.response.body);
      }
      responseData = error.message;
    }
  );
  return responseData;
};
