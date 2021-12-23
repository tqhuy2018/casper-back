import { Controller, Get, Headers, HttpException, HttpStatus, Inject, Param, Post } from "@nestjs/common";
import {
  Crud,
  CrudController,
  Override,
  CrudRequest,
  ParsedRequest,
  ParsedBody,
  CreateManyDto,
} from '@nestjsx/crud';
import { Payment } from "./entities/payment.entity";
import { PaymentService } from "./payment.service";
import { ClientProxy } from "@nestjs/microservices";
import { SCondition } from "@nestjsx/crud-request";
import { UserService } from "../user/user.service";

@Crud({
  model: {
    type: Payment,
  },
  params: {
    apiKey: {
      field: 'apiKey',
      type: "string",
    },
  },
  query: {
    join: {
      store: {
        eager: true,
      },
      transaction: {
        eager: true,
      },
    },
  },
})



@Controller('payment')
export class PaymentController implements CrudController<Payment> {
  constructor(
    public readonly service: PaymentService,
    public readonly userService: UserService,
    @Inject('PAYMENT_SERVICE') private readonly client: ClientProxy
  ) {}


  @Get()
  async getAllByStore(@Headers() headers) {
    const user = await this.userService.findByToken(headers['authorization-x'])

    if (user?.role === 'admin') {
      const payments = this.service.find()
      console.log(payments)
      return payments
    }
    try {
      const payments = this.service.find({
        where: {
          store: {
            apiKey: headers.authorization
          }
        }, relations: ['store']
      })
      return payments
    } catch (err) {
      throw new HttpException('This store does not have such a payments', HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  async getOneByStore(@Param() param, @Headers() headers) {
    const user = await this.userService.findByToken(headers['authorization-x'])
    if (user?.role === 'admin') {
      const payment = await this.service.findOne({
        where: {
          id: param.id
        }
      })

      return payment
    }
    try {
      const payments = await this.service.findOne({
        where: {
          id: param.id,
        }, relations: ['store']
      })
      return payments
      // if (payments.store.apiKey === headers.authorization) {
      //   return payments
      // } else {
      //   throw new HttpException('This payment does not belong to you', HttpStatus.BAD_REQUEST);
      // }

    } catch (err) {
      throw new HttpException('This store does not have such a payment', HttpStatus.BAD_REQUEST);
    }
  }

  get base(): CrudController<Payment> {
    return this;
  }

  @Override()
  getMany(
    @ParsedRequest() req: CrudRequest,
    @Headers() headers,
  ) {
    // const user = this.userService.findByToken()
    return this.base.getManyBase(req);
  }

  @Override('getOneBase')
  getOneAndDoStuff(
    @ParsedRequest() req: CrudRequest,
  ) {
    return this.base.getOneBase(req);
  }

  @Override()
  async createOne(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: Payment,
    @Headers() headers
  ) {
    console.log({ ...dto, apiKey: headers.authorization, headers })
    try {
      const res = await this.client.send('createOne', { ...dto, apiKey: headers.authorization  }).toPromise()
      return {id: res}
    } catch (err) {
      throw new HttpException(err.response, HttpStatus.BAD_REQUEST);
    }


    // return this.base.createOneBase(req, dto);
  }

  @Override()
  createMany(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: CreateManyDto<Payment>
  ) {
    return this.base.createManyBase(req, dto);
  }

  @Override('updateOneBase')
  coolFunction(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: Payment,
  ) {
    return this.base.updateOneBase(req, dto);
  }

  @Override('replaceOneBase')
  awesomePUT(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: Payment,
  ) {
    return this.base.replaceOneBase(req, dto);
  }

  @Override()
  async deleteOne(
    @ParsedRequest() req: CrudRequest,
  ) {
    return this.base.deleteOneBase(req);
  }
}

