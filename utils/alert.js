import SibApiV3Sdk from "@getbrevo/brevo";
import { readFileSync } from "fs";
import { getDir } from "./index.js";
const config = JSON.parse(readFileSync(getDir("config.json"), "utf8"));

// 封装发送邮件的函数
export function sendEmail(subject, htmlContent, recipientEmail) {
  let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  let apiKey = apiInstance.authentications["apiKey"];
  apiKey.apiKey = config.brevoApiKey; // 替换为你的API密钥

  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  // 设置邮件参数
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = { email: "zmzimpl@gmail.com" }; // 发件人信息
  sendSmtpEmail.to = [{ email: recipientEmail }]; // 收件人信息

  // 调用API发送邮件
  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      console.log("API called successfully. Returned data: " + JSON.stringify(data));
    },
    function (error) {
      console.error(error);
    }
  );
}

// 使用示例
// sendEmail("My Alert Email", "<html><body><h1>This is my first transactional email {{params.parameter}}</h1></body></html>", "zmzimpl@gmail.com", "Mile");
