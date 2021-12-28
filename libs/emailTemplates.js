import { model } from "mongoose";

export const adminTemplate = (name, email) => {
    return `<table bgcolor="#E5E5E5" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:0;padding:0;border-collapse:collapse">
    <tbody><tr>
        <td height="100%" style="padding-top:71px">
            <table border="0" cellpadding="0" cellspacing="0" align="center" bgcolor="#ffffff" style="margin:0 auto;padding:0;border-collapse:collapse;border-radius:3px;max-width:572px;width:92%">
                <thead>
                <tr>
                    <td align="center" valign="top">
                        <a href="http://159.122.228.20:3000/logo/kyrio_logo.png" title="Loyverse POS" style="outline:none;display:block;margin-top:17px" target="_blank" data-saferedirecturl="http://159.122.228.20:3000/logo/kyrio_logo.png">
                            <img width="128" height="34.18" src="http://159.122.228.20:3000/logo/kyrio_logo.png" border="0" alt="Loyverse logo" style="border:0;outline:none;text-decoration:none;max-width:100%;display:block;height:auto" class="CToWUd">
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
                © 2020 <a style="text-decoration:none;color:#2d9cdb" href="#"><span class="il">Kyrio</span></a>
            </p>
        </td>
    </tr>
</tbody></table>`;
}
export const userTemplate = (id) => {
    return `<table bgcolor="#E5E5E5" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:0;padding:0;border-collapse:collapse">
    <tbody><tr>
        <td height="100%" style="padding-top:71px">
            <table border="0" cellpadding="0" cellspacing="0" align="center" bgcolor="#ffffff" style="margin:0 auto;padding:0;border-collapse:collapse;border-radius:3px;max-width:572px;width:92%">
                <thead>
                <tr>
                    <td align="center" valign="top">
                        <a href="http://159.122.228.20:3000/logo/kyrio_logo.png" title="Kyrio POS" style="outline:none;display:block;margin-top:17px" target="_blank" data-saferedirecturl="http://159.122.228.20:3000/logo/kyrio_logo.png">
                            <img width="128" height="34.18" src="http://159.122.228.20:3000/logo/kyrio_logo.png" border="0" alt="Kyrio logo" style="border:0;outline:none;text-decoration:none;max-width:100%;display:block;height:auto" class="CToWUd">
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
                        <a href="http://159.122.228.20:3000/kyrio/v1/users/confirm?u=${id}" title="Kyrio POS" style="outline:none;display:inline-block;text-decoration:none;font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:500;font-size:14px;color:white;background-color:#0080C1;text-align:center;padding:16px;margin:0 auto;border-radius:3px" target="_blank">
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
                © 2020 <a style="text-decoration:none;color:#2d9cdb" href="#"><span class="il">Kyrio</span></a>
            </p>
        </td>
    </tr>
</tbody></table>`;
}
const receiptItems =  (items) =>{
    
    let itemsData =   items.map(item =>{
        // console.log(item.modifiers);
        item.modifiers.map(md =>{
            // console.log(md.modifier);
            // console.log(md.options);
        })
        let name = ""
        let proTotal = 0;
        proTotal =  item.quantity * item.price;
        if(item.name){
            name= item.name;
        }
        return  `<tr><td valign="top" style="max-width:75%;padding:11px 0 0 16px">
        <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:left;margin:0;line-height:16px;word-break:break-word"> `+ name +`
                                               
                                            </p>
                                        </td>
                                        <td valign="top" style="padding:11px 0 0 0">
                                                <img alt="Item with discount" width="15" height="15" src="https://ci6.googleusercontent.com/proxy/0WAsgc9lEOUfNeDFVitRDUvFQd8rh8V0C1lWXouDjvmeNVQWxrCf6J2rMgVSSYg4vELrYc5elAYgVA=s0-d-e1-ft#https://r.loyverse.com/img/discount.png" style="float:right;margin:1px 7px 0 0" class="CToWUd">
                                        </td>
                                        <td valign="top" style="padding:11px 16px 0 0;width:1%;white-space:nowrap">
                                            <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:right;margin:0;line-height:16px">
                                                `+ proTotal +`
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" style="padding:0 16px">
                                            <p style="color:rgba(0,0,0,0.54);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:13px;text-align:left;margin:0;line-height:16px;padding-top:5px">
                                                `+ item.quantity + ` × `+ item.price+`
                                            </p>
                                                `+ item.modifiers.map(md =>{
                                                    return md.options.map(op => {
                                                        return  `<p style="color:rgba(0,0,0,0.54);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:13px;text-align:left;margin:0;line-height:16px;padding-top:4px">
                                                        + `+ op.option_name + `(` + op.price*item.quantity+`) 
                                                        </p>`
                                                    })
                                                   
                                                }) +`
                                                
                                        </td>
                                    </tr>` ;
    });
    console.log(itemsData);
    return itemsData;
}
export const receiptTemplate =  (receipt) => {
    let device_name, customer_name , store_name, dining_option, cashier_name = "";
    if(receipt.store){
        store_name = receipt.store.name
    }
    if(receipt.device){
        device_name = receipt.device.name
    }
    if(receipt.customer){
        customer_name = receipt.customer.name
    }
    if(receipt.dining_option){
        dining_option = receipt.dining_option.name
    }
    if(receipt.cashier){
        cashier_name = receipt.cashier.name
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
                                    `+ store_name +`
                                </h1>
                                <p style="border-bottom:dashed 1px rgba(0,0,0,0.12);margin:12px 16px 0"></p>
                            </td>
                        </tr>
                    </tbody>
                    
                    <tbody>
                        <tr>
                            <td>
                                <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:34px;line-height:40px;text-align:center;margin:8px 0 0">
                                    `+ receipt.total_price +`
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
                                    Cashier: `+ cashier_name +`
                                </p>
                                <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:left;margin:0;padding:4px 16px 0;line-height:16px;word-break:break-word">
                                    POS: `+ store_name +`
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p style="border-bottom:dashed 1px rgba(0,0,0,0.12);margin:12px 16px 0"></p>
                            </td>
                        </tr>
                    </tbody>
                    
                        <tbody>
                            <tr>
                                <td>
                                    <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:bold;font-size:14px;text-align:left;padding:12px 16px 11px;margin:0;line-height:16px;word-break:break-word">
                                        `+ dining_option +`
                                    </p>
                                    <p style="border-bottom:dashed 1px rgba(0,0,0,0.12);margin:0 16px"></p>
                                </td>
                            </tr>
                        </tbody>
                    
                    <tbody>
                        <tr>
                            <td>
                                <table border="0" cellpadding="0" cellspacing="0" style="width:100%">
                                        <tbody>
                                                    `+ receiptItems(receipt.items) +`
                                        
                                        
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
                                                    <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:left;margin:0;word-break:break-word">
                                                        Percentage Discount
                                                    </p>
                                                </td>
                                                <td valign="top" style="max-width:25%;padding:0 16px 0 0;line-height:16px">
                                                    <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:right;margin:0;direction:ltr">
                                                        -25
                                                    </p>
                                                </td>
                                            </tr>
                                    </tbody></table>
                                    <p style="border-bottom:dashed 1px rgba(0,0,0,0.12);margin:12px 16px 11px;word-break:break-word"></p>
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
                                                        225
                                                    </p>
                                                </td>
                                            </tr>
                                                <tr>
                                                    <td valign="top" style="max-width:75%;padding:0 0 0 16px;line-height:16px">
    
                                                        <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:left;margin:0;padding-bottom:4px;word-break:break-word">
                                                            <span>Included In Price,</span> <span>&lrm;10%</span>
                                                                <span style="color:rgba(0,0,0,0.54)">(included)</span>
                                                        </p>
                                                    </td>
                                                    <td valign="top" style="max-width:25%;padding:0 16px 0 0;line-height:16px">
    
                                                        <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:right;margin:0;padding-bottom:4px">
                                                            20
                                                        </p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td valign="top" style="max-width:75%;padding:0 0 0 16px;line-height:16px">
    
                                                        <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:left;margin:0;word-break:break-word">
                                                            <span>Added In Price,</span> <span>&lrm;10%</span>
                                                        </p>
                                                    </td>
                                                    <td valign="top" style="max-width:25%;padding:0 16px 0 0;line-height:16px">
    
                                                        <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:right;margin:0">
                                                            21
                                                        </p>
                                                    </td>
                                                </tr>
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
                                                246
                                            </p>
                                        </td>
                                    </tr>
    
                                            <tr>
                                                <td colspan="2" height="12"></td>
                                            </tr>
                                                <tr>
                                                    <td valign="top" style="max-width:75%;padding:0 0 0 16px;line-height:16px">
                                                        <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:left;margin:0;padding-bottom:4px;word-break:break-word">
                                                            Cash
                                                        </p>
                                                    </td>
                                                    <td valign="top" style="max-width:25%;padding:0 16px 0 0;line-height:16px">
                                                        <p style="color:rgba(0,0,0,0.87);font-family:Roboto,Arial,Helvetica,sans-serif;font-weight:normal;font-size:14px;text-align:right;margin:0;padding-bottom:4px">
                                                            246
                                                        </p>
                                                    </td>
                                                </tr>
    
                                    
                                    
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
                                                30/09/2021 19:37
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
                    © 2021
                    <a style="text-decoration:none;color:#2d9cdb" href="https://loyverse.com/?utm_source=email&amp;utm_medium=Receipt" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://loyverse.com/?utm_source%3Demail%26utm_medium%3DReceipt&amp;source=gmail&amp;ust=1633099032775000&amp;usg=AFQjCNGThhtKaKViYMKd8QqPt-PC_I-NXQ">Loyverse</a>.
                    All rights reserved.
                </p>
            </td>
        </tr>
    </tbody></table><div class="yj6qo"></div><div class="adL">
    </div></div>`;
}