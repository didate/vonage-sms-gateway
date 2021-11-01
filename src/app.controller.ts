import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import Vonage from "@vonage/server-sdk";

@Controller()
export class AppController {

  vonage: Vonage;

  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService
  ) {
    this.vonage = new Vonage({
      apiKey: this.configService.get<string>('VONAGE_API_KEY'),
      apiSecret: this.configService.get<string>('VONAGE_SECRET')
    }, {});
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/send-sms')
  sendSMS(@Query() query): void {
   
    const API = query.smsapikey;
    const TO = query.to;
    const MESSAGE = query.content;
    const FROM = this.configService.get<string>('SENDER_NAME');

    if (API === this.configService.get<string>('SMS_GATEWAY_KEY')) {

      this.vonage.message.sendSms(FROM, TO, MESSAGE, { type: 'unicode' }, (err, responseData) => {
        if (err) {
          throw err;
        } else {
          if (responseData.messages[0]['status'] !== "0") {
            console.log(responseData.messages);
            throw `Message failed with error: ${responseData.messages[0]['error-text']}`;
          }
        }
      });
    }
  }
}
