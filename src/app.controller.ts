import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { config } from 'rxjs';

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
  async deploy(): Promise<string> {
    await this.appService.config("b")
    console.log("config")
    await this.appService.deploy("b")
    console.log("deploy")

    return "done"
  }


}
