import {
  receiptTemplate,
  adminTemplate,
  userTemplate,
  resetPasswordTemplate,
} from "./emailTemplates";
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
    to: "kevindoan@me.com",
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
export const sendPasswordResetEmail = async (emailData) => {
  let userBody = resetPasswordTemplate(emailData._id);
  const userMsg = {
    to: emailData.email,
    from: emailData.from,
    subject: "Kyrio POS: password recovery",
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
  return responseData;
};

export const sendReceiptEmail = async (
  email,
  receipt,
  store,
  decimal,
  pay,
  type
) => {
  let receiptBody = receiptTemplate(receipt, decimal, pay, type);

  // console.log(receiptBody);
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
