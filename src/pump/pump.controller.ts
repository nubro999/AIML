import { Controller, Get, Post } from '@nestjs/common';
import { config } from 'rxjs';
import { PumpService } from './pump.service';

@Controller("/pump")
export class PumpController {
  constructor(private readonly pumpService:PumpService ) {}

  @Get("/deploy")
  async deployToken(){
    console.log("pump.deploy")

    const tokenCreated = await this.pumpService.createNewToken("umi", "UMI")
    
    const tokenAddress = tokenCreated.tokenAddress;
    const tokenName = tokenCreated.tokenName
    const tokenSymbol = tokenCreated.tokenSymbol
    

    this.pumpService.createNewAMM(tokenAddress, tokenName,tokenSymbol,"600");

    return 
  }



}
