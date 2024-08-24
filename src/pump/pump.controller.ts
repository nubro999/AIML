import { Controller, Post, Body } from '@nestjs/common';
import { PumpService } from './pump.service';

@Controller("/pump")
export class PumpController {
  constructor(private readonly pumpService: PumpService) {}

  @Post("/deploy")
  async deployToken(@Body() body: { tokenName: string, tokenSymbol: string }) {
    console.log("pump.deploy");

    const { tokenName, tokenSymbol } = body;

    const tokenCreated = await this.pumpService.createNewToken(tokenName, tokenSymbol);
    
    const tokenAddress = tokenCreated.tokenAddress;

    await this.pumpService.createNewAMM(tokenAddress, tokenName, tokenSymbol, "600");

    return {
      tokenAddress: tokenAddress,
      tokenName: tokenName,
      tokenSymbol: tokenSymbol,
      mintedAmount: tokenCreated.mintedAmount // Assuming this is returned from createNewToken
    };
  }
}
