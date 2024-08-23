import { Controller, Get, Post } from '@nestjs/common';
import { config } from 'rxjs';
import { PumpService } from './pump.service';

@Controller()
export class PumpController {
  constructor(private readonly pumpService:PumpService ) {}

  @Post()
  async deployAMM(){

    return this.pumpService.deployAMM("a","b", "c","100");
  }



}
