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