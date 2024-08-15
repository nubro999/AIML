import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("/prove")
  prove(): string {

    this.appService.prove()

    return "done"
  }

  @Get("/deploy")
  deploy(): string {

    this.appService.deploy("a")

    return "done"
  }

  @Get("/config")
  config(): string {

    this.appService.config("a")

    return "done"
  }
}
