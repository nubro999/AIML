import { Controller, Post, Body } from '@nestjs/common';
import { PumpService } from './pump.service';
import { PumpRepository } from './pump.repository';

@Controller("/pump")
export class PumpController {
  constructor(private readonly pumpService: PumpService,
  ) {}

  @Post("/deploy")
  async deployToken(@Body() body: { tokenName: string, tokenSymbol: string }) {
    console.log("pump.deploy");

    const { tokenName, tokenSymbol } = body;

    const tokenCreated = await this.pumpService.createNewToken(tokenName, tokenSymbol);
    
    const tokenAddress = tokenCreated.tokenAddress;

    const ammCreated = await this.pumpService.createNewAMM(tokenAddress, tokenName, tokenSymbol, "600");

    await this.pumpService.addPump(tokenAddress, ammCreated, tokenCreated.owner , tokenName, tokenSymbol);

    return {
      tokenAddress: tokenAddress,
      tokenName: tokenName,
      tokenSymbol: tokenSymbol,
      mintedAmount: tokenCreated.mintedAmount // Assuming this is returned from createNewToken
    };
  }

  @Post("/created")
  async tokensCreated(@Body() body: { creator: string }) {

    const { creator } = body;

    try {
      const tokens = await this.pumpService.getTokensByCreator(creator);
      
      return {
        creator: creator,
        tokens: tokens.map(token => ({
          id: token.id,
          tokenAddress: token.tokenAddress,
          ammAddress: token.ammAddress,
          name: token.name,
          symbol: token.symbol
        }))
      };
    } catch (error) {
      console.error('Error in tokensCreated:', error);
      throw error; // Or handle the error as appropriate for your application
    }
  }
}
