import { Body, Controller, Get, Headers, HttpException, HttpStatus, Inject, Param, Post } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { ClientProxy } from "@nestjs/microservices";
import { UserService } from "../user/user.service";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('store payment')
@Controller('/payment')
export class PaymentStoreController {

  constructor(
    public readonly service: PaymentService,
    public readonly userService: UserService,
    @Inject('PAYMENT_SERVICE') private readonly client: ClientProxy
  ) {}

  @Post('send-mail-bill')
  public async sendMailBill(@Body() billMailDto) {
    try {
      return await this.service.sendMailBill(billMailDto);
    } catch (err) {
      throw new HttpException(err.response, HttpStatus.BAD_REQUEST);
    }
  }

}

