import { model } from "mongoose";
import { groupBy, sumBy, orderBy } from "lodash";
import { amountFormat } from "../function/globals";

export const adminTemplate = (name, email) => {
  return `<table bgcolor="#E5E5E5" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:0;padding:0;border-collapse:collapse">
    <tbody><tr>
        <td height="100%" style="padding-top:71px">
            <table border="0" cellpadding="0" cellspacing="0" align="center" bgcolor="#ffffff" style="margin:0 auto;padding:0;border-collapse:collapse;border-radius:3px;max-width:572px;width:92%">
                <thead>
                <tr>
                    <td align="center" valign="top">
                        <a href="https://api.kyriopos.com/media/logo/kyrio_logo.png" title="Loyverse POS" style="outline:none;display:block;margin-top:17px" target="_blank" data-saferedirecturl="https://api.kyriopos.com/media/logo/kyrio_logo.png">
                            <img width="128" height="34.18" src="https://api.kyriopos.com/media/logo/kyrio_logo.png" border="0" alt="Loyverse logo" style="border:0;outline:none;text-decoration:none;max-width:100%;display:block;height:auto" class="CToWUd">
                        </a>
                    </td>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td valign="top" align="center" style="margin-top:44px;padding:0 16px">
                        <h1 style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:20px;margin:44px 0 18px 0">
                            Congratulations! New user have created a <span class="il">Kyrio</span> account
                        </h1>
                        <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px">
                            Business Name: ${name}<br/>
                            Email: ${email}<br/>
                        </p>
                    </td>
                </tr>
                </tbody>

                <tbody>
                <tr>
                    <td>
                        <p style="font-family:Roboto,Arial,Helvetica,sans-serif;color:rgba(0,0,0,0.87);text-align:center;font-size:12px;line-height:1.5;margin-bottom:24px;padding:0 16px">
                            Sincerely, The <span class="il">Kyrio</span> team
                        </p>
                    </td>
                </tr>
                </tbody>
            </table>
        </td>
    </tr>
    <tr>
        <td valign="top">
            <p style="font-family:Roboto,Arial,Helvetica,sans-serif;color:rgba(0,0,0,0.87);font-size:12px;text-align:center;margin:22px 0 78px 0">
                © 2022 <a style="text-decoration:none;color:#2d9cdb" href="#"><span class="il">Kyrio POS</span></a>
            </p>
        </td>
    </tr>
</tbody></table>`;
};
export const userTemplate = (id) => {
  return `<table bgcolor="#E5E5E5" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:0;padding:0;border-collapse:collapse">
    <tbody><tr>
        <td height="100%" style="padding-top:71px">
            <table border="0" cellpadding="0" cellspacing="0" align="center" bgcolor="#ffffff" style="margin:0 auto;padding:0;border-collapse:collapse;border-radius:3px;max-width:572px;width:92%">
                <thead>
                <tr>
                    <td align="center" valign="top">
                        <a href="https://api.kyriopos.com/media/logo/kyrio_logo.png" title="Kyrio POS" style="outline:none;display:block;margin-top:17px" target="_blank" data-saferedirecturl="https://api.kyriopos.com/media/logo/kyrio_logo.png">
                            <img width="128" height="34.18" src="https://api.kyriopos.com/media/logo/kyrio_logo.png" border="0" alt="Kyrio logo" style="border:0;outline:none;text-decoration:none;max-width:100%;display:block;height:auto" class="CToWUd">
                        </a>
                    </td>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td valign="top" align="center" style="margin-top:44px;padding:0 16px">
                        <h1 style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:20px;margin:44px 0 18px 0">
                            Congratulations! You have created a <span class="il">Kyrio</span> account
                        </h1>
                        <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px">
                            Please confirm this by clicking on the button below
                        </p>
                    </td>
                </tr>

                <tr>
                    <td style="text-align:center;padding:26px 0 30px 0">
                        <a href="https://dashboard.kyriopos.com/#/confirm/${id}" title="Kyrio POS" style="outline:none;display:inline-block;text-decoration:none;font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:500;font-size:14px;color:white;background-color:#0080C1;text-align:center;padding:16px;margin:0 auto;border-radius:3px" target="_blank">
                            CONFIRM REGISTRATION
                        </a>
                    </td>
                </tr>
                </tbody>

                <tbody>
                <tr>
                    <td>
                        <p style="font-family:Roboto,Arial,Helvetica,sans-serif;color:rgba(0,0,0,0.87);text-align:center;font-size:12px;line-height:1.5;margin-bottom:24px;padding:0 16px">
                            If you did not register with the <span class="il">Kyrio</span> application and have received<br>this email by mistake, please ignore it.
                            <br>
                            Sincerely, The <span class="il">Kyrio</span> team
                        </p>
                    </td>
                </tr>
                </tbody>
            </table>
        </td>
    </tr>
    <tr>
        <td valign="top">
            <p style="font-family:Roboto,Arial,Helvetica,sans-serif;color:rgba(0,0,0,0.87);font-size:12px;text-align:center;margin:22px 0 78px 0">
                © 2022 <a style="text-decoration:none;color:#2d9cdb" href="#"><span class="il">Kyrio POS</span></a>
            </p>
        </td>
    </tr>
</tbody></table>`;
};
const ShowPercentDiscounts = (receipt, decimal) => {
  if (receipt.total_discount > 0) {
    const discounts = [];
    receipt.items.map((ite) =>
      ite.discounts.map((dis) =>
        discounts.push({
          _id: dis._id,
          title: dis.title,
          percent: dis.type == "Percentage" ? dis.value + "%" : "",
          type: dis.type,
          price: parseFloat(dis.discount_total).toFixed(2),
        })
      )
    );

    let group = groupBy(discounts, "_id");
    let keys = Object.keys(group);
    return keys
      .map((key) => {
        return `<tr>
                <td valign="top" style="max-width:75%;padding:0 0 0 16px;line-height:16px">
                    <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:left;margin:0;word-break:break-word">
                    ${group[key][0].title} ${group[key][0].percent}
                    </p>
                </td>
                <td valign="top" style="max-width:25%;padding:0 16px 0 0;line-height:16px">
                    <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:right;margin:0;direction:ltr">
                        -${amountFormat(
                          sumBy(group[key].map((p) => parseFloat(p.price))),
                          decimal
                        )}
                    </p>
                </td>
            </tr>`;
      })
      .join("");
  } else {
    return ``;
  }
};
const ShowAmountDiscounts = (receipt, decimal) => {
  if (receipt.total_discount > 0) {
    const discounts = [];
    receipt.discounts.map((ite) =>
      discounts.push({
        _id: ite._id,
        title: ite.title,
        percent: ite.type == "Percentage" ? ite.value + "%" : "",
        type: ite.type,
        price: parseFloat(ite.value).toFixed(2),
      })
    );

    let group = groupBy(discounts, "_id");
    let keys = Object.keys(group);

    return keys
      .map((key) => {
        return `<tr>
                <td valign="top" style="max-width:75%;padding:0 0 0 16px;line-height:16px">
                    <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:left;margin:0;word-break:break-word">
                    ${group[key][0].title} ${group[key][0].percent}
                    </p>
                </td>
                <td valign="top" style="max-width:25%;padding:0 16px 0 0;line-height:16px">
                    <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:right;margin:0;direction:ltr">
                        -${amountFormat(
                          sumBy(group[key].map((p) => parseFloat(p.price))),
                          decimal
                        )}
                    </p>
                </td>
            </tr>`;
      })
      .join("");
  } else {
    return ``;
  }
};
const showModifiers = (item, decimal) => {
  return item.modifiers
    .map((md) => {
      return md.options
        .map((op) => {
          return `<p style="color:rgba(0,0,0,0.54);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:13px;text-align:left;margin:0;line-height:16px;padding-top:4px">
              + ${op.option_name}(${amountFormat(
            op.price * item.quantity,
            decimal
          )}) 
              </p>`;
        })
        .join("");
    })
    .join("");
};
const receiptItems = (items, decimal) => {
  return items
    .map((item) => {
      let name = "";
      let proTotal = 0;
      proTotal = item.quantity * item.price;
      if (item.name) {
        name = item.name;
      }
      return `<tr><td valign="top" style="max-width:75%;padding:11px 0 0 16px">
        <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:left;margin:0;line-height:16px;word-break:break-word"> ${name}</p>
        </td>
        <td valign="top" style="padding:11px 16px 0 0;width:1%;white-space:nowrap">
            <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:right;margin:0;line-height:16px">
                ${amountFormat(proTotal, decimal)}
            </p>
        </td>
    </tr>
    <tr>
        <td colspan="3" style="padding:0 16px">
            <p style="color:rgba(0,0,0,0.54);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:13px;text-align:left;margin:0;line-height:16px;padding-top:5px">
                ${item.quantity} × ${amountFormat(item.price, decimal)}
            </p>
                ${showModifiers(item, decimal)}            
            <p style="color:rgba(0,0,0,0.54);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:13px;text-align:left;margin:0;line-height:16px;padding-top:4px">
                <i>${item.comment}</i>
            </p>
        </td>
    </tr>`;
    })
    .join("");
};

const itemTaxes = (items, decimal) => {
  const taxes = [];
  items.map((ite) =>
    ite.taxes.map((tax) =>
      taxes.push({
        _id: tax._id,
        title: tax.title + " " + tax.tax_rate + "%",
        type: tax.tax_type == "Included in the price" ? "(included)" : "",
        price: parseFloat(tax.tax_total).toFixed(2),
      })
    )
  );
  let group = groupBy(orderBy(taxes, "type", "desc"), "_id");
  let keys = Object.keys(group);
  return keys
    .map((key) => {
      return `<tr>
        <td
          valign="top"
          style="max-width:75%;padding:0 0 0 16px;line-height:16px"
        >
          <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:left;margin:0;padding-bottom:4px;word-break:break-word">
            <span>${group[key][0].title}</span>
            <span style="color:rgba(0,0,0,0.54)">${group[key][0].type}</span>
          </p>
        </td>
        <td
          valign="top"
          style="max-width:25%;padding:0 16px 0 0;line-height:16px"
        >
          <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:right;margin:0;padding-bottom:4px">
            ${amountFormat(
              sumBy(group[key].map((p) => parseFloat(p.price))),
              decimal
            )}
          </p>
        </td>
      </tr>`;
    })
    .join("");
};
const showPayments = (receipt, decimal) => {
  return receipt.payments
    .map((pay) => {
      return `<tr>
      <td valign="top" style="max-width:75%;padding:0 0 0 16px;line-height:16px">
          <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:left;margin:0;padding-bottom:4px;word-break:break-word">
            Amount due
          </p>
      </td>
      <td valign="top" style="max-width:25%;padding:0 16px 0 0;line-height:16px">
          <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:right;margin:0;padding-bottom:4px">
              ${amountFormat(pay.amount, decimal)}
          </p>
      </td>
  </tr>
  ${
    pay.paymentType && pay.paymentType !== ""
      ? `<tr>
      <td valign="top" style="max-width:75%;padding:0 0 0 16px;line-height:16px">
          <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:left;margin:0;padding-bottom:4px;word-break:break-word">
            ${pay.paymentType}
          </p>
      </td>
      <td valign="top" style="max-width:25%;padding:0 16px 0 0;line-height:16px">
          <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:right;margin:0;padding-bottom:4px">
              ${amountFormat(pay.amount + pay.changeAmount, decimal)}
          </p>
      </td>
  </tr>`
      : ``
  }
  ${
    pay.changeAmount && pay.changeAmount !== 0
      ? `<tr>
      <td valign="top" style="max-width:75%;padding:0 0 0 16px;line-height:16px">
          <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:left;margin:0;padding-bottom:4px;word-break:break-word">
          Change
          </p>
      </td>
      <td valign="top" style="max-width:25%;padding:0 16px 0 0;line-height:16px">
          <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:right;margin:0;padding-bottom:4px">
              ${amountFormat(pay.changeAmount, decimal)}
          </p>
      </td>
  </tr>`
      : ``
  }
  `;
    })
    .join("");
};
const showSplitPayments = (receipt, decimal, pay) => {
  if(typeof pay.amount == "undefined"){
    return ""
  } 
  return `<tr>
      <td valign="top" style="max-width:75%;padding:0 0 0 16px;line-height:16px">
          <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:left;margin:0;padding-bottom:4px;word-break:break-word">
            Amount due
          </p>
      </td>
      <td valign="top" style="max-width:25%;padding:0 16px 0 0;line-height:16px">
          <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:right;margin:0;padding-bottom:4px">
              ${amountFormat(pay.amount, decimal)}
          </p>
      </td>
  </tr>
  ${
    pay.paymentType && pay.paymentType !== ""
      ? `<tr>
      <td valign="top" style="max-width:75%;padding:0 0 0 16px;line-height:16px">
          <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:left;margin:0;padding-bottom:4px;word-break:break-word">
            ${pay.paymentType}
          </p>
      </td>
      <td valign="top" style="max-width:25%;padding:0 16px 0 0;line-height:16px">
          <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:right;margin:0;padding-bottom:4px">
              ${amountFormat(pay.amount + pay.changeAmount, decimal)}
          </p>
      </td>
  </tr>`
      : ``
  }
  ${
    pay.changeAmount && pay.changeAmount !== 0
      ? `<tr>
      <td valign="top" style="max-width:75%;padding:0 0 0 16px;line-height:16px">
          <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:left;margin:0;padding-bottom:4px;word-break:break-word">
          Change
          </p>
      </td>
      <td valign="top" style="max-width:25%;padding:0 16px 0 0;line-height:16px">
          <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:right;margin:0;padding-bottom:4px">
              ${amountFormat(pay.changeAmount, decimal)}
          </p>
      </td>
  </tr>`
      : ``
  }
  `;
};
// git password: y7tcpr9WGgBpzsHGWqkF

export const receiptTemplate = (receipt, decimal, pay, type) => {
  let device_name,
    customer_name,
    store_name,
    dining_option,
    cashier_name = "";
  if (receipt.store) {
    store_name = receipt.store.name;
  }
  if (receipt.device) {
    device_name = receipt.device.name;
  }
  if (receipt.customer) {
    customer_name =
      typeof receipt.customer.name == "undefined"
        ? ""
        : receipt.customer.name +
          "<br />" +
          '<p style="border-bottom:dashed 1px rgba(0,0,0,0.12);margin:0 16px"></p>';
  }
  if (receipt.dining_option) {
    dining_option =
      typeof receipt.dining_option.name == "undefined"
        ? ""
        : receipt.dining_option.name +
          "<br />" +
          '<p style="border-bottom:dashed 1px rgba(0,0,0,0.12);margin:0 16px"></p>';
  }
  if (receipt.cashier) {
    cashier_name = receipt.cashier.name;
  }

  return `<div bgcolor="#F5F5F5" marginwidth="0" marginheight="0">

    <table bgcolor="#F5F5F5" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:0;padding:0;border-collapse:collapse">
        <tbody><tr>
            <td height="100%" style="padding-top:71px">
                <table border="0" cellpadding="0" cellspacing="0" align="center" bgcolor="#ffffff" style="margin:0 auto;padding:0;border-collapse:collapse;border-radius:3px;max-width:384px;width:92%">
                    
                    <tbody>
                        <tr>
                            <td height="24"></td>
                        </tr>
                        <tr>
                            <td valign="top" align="center">
                                <h1 style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:bold;font-size:14px;text-align:center;margin:0;padding:0 16px 0;line-height:16px;word-break:break-word">
                                ${store_name}
                                </h1>
                                <p style="border-bottom:dashed 1px rgba(0,0,0,0.12);margin:12px 16px 0"></p>
                            </td>
                        </tr>
                    </tbody>
                    
                    <tbody>
                        <tr>
                            <td>
                                <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:34px;line-height:40px;text-align:center;margin:8px 0 0">
                                    ${amountFormat(
                                      receipt.total_price,
                                      decimal
                                    )}
                                </p>
                                <p style="color:rgba(0,0,0,0.54);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:center;line-height:16px;margin:3px 0 0;word-break:break-word">
                                    Total
                                </p>
                                <p style="border-bottom:dashed 1px rgba(0,0,0,0.12);margin:13px 16px 0"></p>
                            </td>
                        </tr>
                    </tbody>
                    
                    <tbody>
                        <tr>
                            <td height="7"></td>
                        </tr>
                        <tr>
                            <td>
                                <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:left;margin:0;padding:4px 16px 0;line-height:16px;word-break:break-word">
                                    Cashier: ${cashier_name}
                                </p>
                                <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:left;margin:0;padding:4px 16px 0;line-height:16px;word-break:break-word">
                                    POS: ${store_name}
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p style="border-bottom:dashed 1px rgba(0,0,0,0.12);margin:12px 16px 0"></p>
                            </td>
                        </tr>
                    </tbody>
                    ${
                      dining_option !== ""
                        ? `<tbody>
                            <tr>
                                <td>
                                    <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:bold;font-size:14px;text-align:left;padding:12px 16px 11px;margin:0;line-height:16px;word-break:break-word">
                                    ${dining_option}
                                    </p>
                                    
                                </td>
                            </tr>
                        </tbody>`
                        : ``
                    }
                    
                    <tbody>
                        <tr>
                            <td>
                                <table border="0" cellpadding="0" cellspacing="0" style="width:100%">
                                        <tbody>
                                        ${receiptItems(
                                          receipt.items,
                                          decimal
                                        )}        
                                </tbody></table>
                                <p style="border-bottom:dashed 1px rgba(0,0,0,0.12);margin:12px 16px 11px"></p>
                            </td>
                        </tr>
                    </tbody> 
                    
                    <tbody>
        <tr>
            <td>
                <table border="0" cellpadding="0" cellspacing="0" style="width:100%">
                        <tbody>
                        ${ShowAmountDiscounts(receipt, decimal)}
                        ${ShowPercentDiscounts(receipt, decimal)}
                        </tbody></table>
    ${
      receipt.total_discount > 0
        ? '<p style="border-bottom:dashed 1px rgba(0,0,0,0.12);margin:12px 16px 11px;word-break:break-word"></p>'
        : ""
    }
            </td>
        </tr>
    </tbody>
                    
                        <tbody>
                            <tr>
                                <td>
                                    <table border="0" cellpadding="0" cellspacing="0" style="width:100%">
                                            <tbody><tr>
                                                <td valign="top" style="max-width:75%;padding:0 0 0 16px;line-height:16px">
                                                    <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:600;font-size:14px;text-align:left;margin:0;padding-bottom:4px;word-break:break-word">
                                                        Subtotal
                                                    </p>
                                                </td>
                                                <td valign="top" style="max-width:25%;padding:0 16px 0 0;line-height:16px">
    
                                                    <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:600;font-size:14px;text-align:right;margin:0;padding-bottom:4px">
                                                        ${
                                                          amountFormat(
                                                            receipt.sub_total,
                                                            decimal
                                                          ) || 0
                                                        }
                                                    </p>
                                                </td>
                                            </tr>
                                            ${itemTaxes(
                                              receipt.items,
                                              decimal
                                            )}         
                                    </tbody></table>
                                    <p style="border-bottom:dashed 1px rgba(0,0,0,0.12);margin:12px 16px 11px"></p>
                                </td>
                            </tr>
                        </tbody>
                    
                    <tbody>
                        <tr>
                            <td>
                                <table border="0" cellpadding="0" cellspacing="0" style="width:100%">
                                    <tbody><tr>
                                        <td valign="top" style="max-width:75%;padding:0 0 0 16px;line-height:16px">
                                            <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:600;font-size:14px;text-align:left;margin:0;padding-bottom:4px;word-break:break-word">
                                                    Total
                                            </p>
                                        </td>
                                        <td valign="top" style="max-width:25%;padding:0 16px 0 0;line-height:16px">
                                            <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:600;font-size:14px;text-align:right;margin:0;padding-bottom:4px">
                                                ${amountFormat(
                                                  receipt.total_price,
                                                  decimal
                                                )}
                                            </p>
                                        </td>
                                    </tr>
    
                                            <tr>
                                                <td colspan="2" height="12"></td>
                                            </tr>
                                                ${
                                                  type == "full"
                                                    ? showPayments(
                                                        receipt,
                                                        decimal
                                                      )
                                                    : showSplitPayments(
                                                        receipt,
                                                        decimal,
                                                        pay
                                                      )
                                                }
                                </tbody></table>
                                    <p style="border-bottom:dashed 1px rgba(0,0,0,0.12);margin:8px 0 12px"></p>
                            </td>
                        </tr>
                    </tbody>
    
    
                    
                    <tbody>
                        <tr>
                            <td>
                                <table border="0" cellpadding="0" cellspacing="0" style="width:100%">
                                    <tbody><tr>
                                        <td valign="top" style="max-width:75%;padding:0 0 12px 16px;line-height:16px">
                                            <p style="color:rgba(0,0,0,0.54);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:left;margin:0">
                                            ${receipt.sale_timestamp}
                                            </p>
                                        </td>
                                        <td valign="top" style="max-width:75%;padding:0 16px 12px 0;line-height:16px">
                                            <p style="color:rgba(0,0,0,0.54);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:right;margin:0;direction:ltr">
                                                № 1-1034
                                            </p>
                                        </td>
                                    </tr>
                                </tbody></table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
        <tr>
            <td valign="top">
                <p style="font-family:Roboto,Arial,Helvetica,sans-serif;color:rgba(0,0,0,0.54);font-size:13px;text-align:center;margin:20px 0 70px;line-height:15px;word-break:break-word">
                    © 2022
                    <a style="text-decoration:none;color:#2d9cdb" href="" target="_blank" data-saferedirecturl="https://dashboard.kyriopos.com">Kyrio POS</a>.
                    All rights reserved.
                </p>
            </td>
        </tr>
    </tbody></table><div class="yj6qo"></div><div class="adL">
    </div></div>`;
};

export const lowStockNotificationEmail = () => {
  return `<div
    id="m_-9014499067652848993kyriopos-email"
    style="width: 100%; padding: 30px 0px 50px 0px; background-color: #f2f2f2"
  >
    <div style="width: 520px; max-width: 90%; margin: 0 auto">
      <p
        style="
          text-align: center;
          border-bottom: 1px solid #e7e7e7;
          padding-bottom: 20px;
          margin-bottom: 0px;
        "
      >
        <a
          href="https://dashboard.kyriopos.com/#/items"
          title="Go to the Kyrio POS website"
          target="_blank"
          data-saferedirecturl="https://www.google.com/url?q=https://dashboard.kyriopos.com/#/items"
        >
          <img
            src="https://api.kyriopos.com/media/logo/kyrio_logo.png"
            style="height: 100px"
            alt="Kyrio POS"
            class="CToWUd"
          />
        </a>
      </p>
  
      <table
        style="
          width: 100%;
          margin: 0 auto;
          background: #fff;
          border-radius: 6px;
          min-height: 300px;
        "
      >
        <thead>
          <tr>
            <td>
              <p
                style="text-align: center; padding-bottom: 0px; padding-top: 20px"
              >
                <img
                  src="https://ci4.googleusercontent.com/proxy/j-SfKzyPH_rRFnDIUOSdCUkQE-YokPNRZN5uqjGcHM9MNQN_8cX0mJXC_Xs48T1uZP5rrCwj06EtwKjZUTwVfdywTL276rofpihkKq-I93ZrteBokR2_EeMykuRYAgqqXQA=s0-d-e1-ft#https://s3-eu-west-1.amazonaws.com/kyriopos/staticimg/e-mail/icon_inventory.png"
                  width="110px"
                  alt="Kyrio POS"
                  class="CToWUd"
                />
              </p>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 0px">
              <p
                style="
                  font-family: Arial, Helvetica, sans-serif;
                  font-size: 26px;
                  color: #272727;
                  line-height: 22px;
                  font-weight: 400;
                  margin-bottom: 0px;
                  margin-top: 0px;
                  padding: 0px 20px 0px 20px;
                  text-align: center;
                "
              >
                Low stock notification
              </p>
  
              <p
                style="
                  font-family: HelveticaNeue Medium, sans-serif;
                  font-size: 20px;
                  color: #272727;
                  line-height: 20pt;
                  font-weight: 500;
                  margin-bottom: 0px;
                  margin-top: 5px;
                  padding: 1px 20px 0px 20px;
                  text-align: center;
                "
              >
                Tahir POS
              </p>
  
              <p
                style="
                  font-family: HelveticaNeue Medium, sans-serif;
                  font-size: 20px;
                  text-transform: capitalize;
                  color: #272727;
                  font-weight: 500;
                  margin-bottom: 0px;
                  margin-top: 5px;
                  padding: 0px 20px 15px 20px;
                  text-align: center;
                "
              >
                Tuesday, 06/15/2021
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0px 20px">
              <table
                style="margin-top: 15px; margin-bottom: 15px"
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
              >
                <tbody>
                  <tr>
                    <td
                      style="
                        font-family: Arial, Helvetica, sans-serif;
                        border-top: 1px dotted #fff;
                        border-bottom: 1px dotted #fff;
                        padding: 2px 0px;
                        font-size: 14px;
                        color: #333;
                        text-align: left;
                        line-height: 150%;
                      "
                    >
                      Zinger
                    </td>
  
                    <td
                      style="
                        font-family: Arial, Helvetica, sans-serif;
                        border-top: 1px dotted #fff;
                        border-bottom: 1px dotted #fff;
                        padding: 2px 0px;
                        font-size: 16px;
                        color: #f44336;
                        text-align: right;
                        width: 90px;
                        height: 30px;
                      "
                    >
                      0
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0px 0px 30px 0px">
              <div style="margin-bottom: 35px">
                <a
                  href="https://dashboard.kyriopos.com/#/items"
                  title="Inventory management"
                  style="
                    display: block;
                    margin: 0 auto;
                    width: 260px;
                    text-align: center;
                    text-decoration: none;
                    padding: 18px 0px 16px 0px;
                    background: #2686c0;
                    color: #fff;
                    font-size: 15px;
                    font-weight: normal;
                    border-radius: 4px;
                    font-family: Arial, Helvetica, sans-serif;
                    text-transform: uppercase;
                    margin-top: 15px;
                  "
                  target="_blank"
                  data-saferedirecturl="https://www.google.com/url?q=https://dashboard.kyriopos.com/#/items"
                  >Inventory management</a
                >
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div style="padding: 0px">
                <p
                  style="
                    margin-bottom: 15px;
                    margin-top: 15px;
                    padding-right: 30px;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 14px;
                    line-height: 20px;
                    text-align: center;
                  "
                >
                  <a
                    style="color: #06c"
                    href="mailto:help@kyriopos.com"
                    title="Write a mail"
                    target="_blank"
                    >help@kyriopos.com</a
                  >
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <p
                style="
                  text-align: center;
                  font-size: 14px;
                  color: #999;
                  font-family: Helvetica Neue, Helvetica, sans-serif;
                  padding-top: 15px;
                "
              >
                © 2022 Kyrio POS. All rights reserved.<br />
              </p>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="yj6qo"></div>
      <div class="adL"></div>
    </div>
    <div class="adL"></div>
  </div>
  `;
};

export const resetPasswordTemplate = (userId) => {
  return `<div bgcolor="#E5E5E5" marginwidth="0" marginheight="0">
  <table
    bgcolor="#E5E5E5"
    border="0"
    cellpadding="0"
    cellspacing="0"
    width="100%"
    style="margin: 0; padding: 0; border-collapse: collapse"
  >
    <tbody>
      <tr>
        <td height="100%" style="padding-top: 71px">
          <table
            border="0"
            cellpadding="0"
            cellspacing="0"
            align="center"
            bgcolor="#ffffff"
            style="
              margin: 0 auto;
              padding: 0;
              border-collapse: collapse;
              border-radius: 3px;
              max-width: 572px;
              width: 92%;
            "
          >
            <thead>
              <tr>
                <td align="center" valign="top">
                  <a
                    href="#"
                    title="Kyrio POS"
                    style="outline: none; display: block; margin-top: 17px"
                    target="_blank"
                    data-saferedirecturl="https://api.kyriopos.com/media/logo/kyrio_logo.png"
                  >
                    <img
                      width="128"
                      height="34.18"
                      src="https://api.kyriopos.com/media/logo/kyrio_logo.png"
                      border="0"
                      alt="Kyrio logo"
                      style="
                        border: 0;
                        outline: none;
                        text-decoration: none;
                        max-width: 100%;
                        display: block;
                        height: auto;
                      "
                      class="CToWUd"
                    />
                  </a>
                </td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  valign="top"
                  align="center"
                  style="margin-top: 44px; padding: 0 16px"
                >
                  <h1
                    style="
                      color: rgba(0, 0, 0, 0.87);
                      font-family: Roboto, Arial, Helvetica, sans-serif;
                      font-weight: normal;
                      font-size: 20px;
                      margin: 44px 0 18px 0;
                    "
                  >
                    Password recovery
                  </h1>
                  <p
                    style="
                      color: rgba(0, 0, 0, 0.87);
                      font-family: Roboto, Arial, Helvetica, sans-serif;
                      font-weight: normal;
                      font-size: 14px;
                    "
                  >
                    To create a new password click on the button below
                  </p>
                </td>
              </tr>

              <tr>
                <td style="text-align: center; padding: 26px 0 30px 0">
                  <a
                    href="https://dashboard.kyriopos.com/#/changepswd/${userId}"
                    title="Kyrio POS"
                    style="
                      outline: none;
                      display: inline-block;
                      text-decoration: none;
                      font-family: Roboto, Arial, Helvetica, sans-serif;
                      font-weight: 500;
                      font-size: 14px;
                      color: white;
                      background-color: #7cb342;
                      text-align: center;
                      padding: 16px;
                      border-radius: 3px;
                    "
                    target="_blank"
                    data-saferedirecturl="https://dashboard.kyriopos.com/#/changepswd/${userId}"
                  >
                    CREATE A NEW PASSWORD
                  </a>
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr>
                <td>
                  <p
                    style="
                      font-family: Roboto, Arial, Helvetica, sans-serif;
                      color: rgba(0, 0, 0, 0.87);
                      text-align: center;
                      font-size: 12px;
                      line-height: 1.5;
                      margin-bottom: 24px;
                      padding: 0 16px;
                    "
                  >
                    If you have questions, please visit
                    <a
                      style="text-decoration: none; color: #2d9cdb"
                      href="https://dashboard.kyriopos.com/"
                      target="_blank"
                      data-saferedirecturl="https://dashboard.kyriopos.com/"
                      >Kyrio Help Center</a
                    >
                    and
                    <a
                      style="text-decoration: none; color: #2d9cdb"
                      href="https://dashboard.kyriopos.com/"
                      target="_blank"
                      data-saferedirecturl="https://dashboard.kyriopos.com/"
                      >Kyrio Community</a
                    >
                    or chat with our consultants.<br />
                    They are available 24/7 and always happy to assist.<br />
                    <br />
                    Sincerely, The Kyrio team
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td valign="top">
          <p
            style="
              font-family: Roboto, Arial, Helvetica, sans-serif;
              color: rgba(0, 0, 0, 0.87);
              font-size: 12px;
              text-align: center;
              margin: 22px 0 78px 0;
            "
          >
            © 2022
            <a
              style="text-decoration: none; color: #2d9cdb"
              href="https://dashboard.kyriopos.com/"
              target="_blank"
              data-saferedirecturl="https://dashboard.kyriopos.com/"
              >Kyrio</a
            >
          </p>
        </td>
      </tr>
    </tbody>
  </table>
</div>`;
};
