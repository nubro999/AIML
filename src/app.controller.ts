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
    await this.appService.config("c")
    console.log("--------------------------------------------------config")
    await this.appService.updateNetworkId("c")
    console.log("--------------------------------------------------change")
    await this.appService.deploy("c")
    console.log("--------------------------------------------------deploy")

    return "done"
  }


}
