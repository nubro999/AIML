import { Controller, Get, Post, HttpException, HttpStatus } from '@nestjs/common';
import { ItemService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  getHello(): string {
    return "Hello from ItemsController!";
  }

  @Get('/deploy')
  async deployContract(): Promise<{ message: string; transactionHash?: string }> {
    try {
      const result = await this.itemService.Deploy();
      if (result.success) {
        return { 
          message: 'Item contract deployed successfully', 
          transactionHash: result.hash 
        };
      } else {
        throw new HttpException(result.error || 'Deployment failed', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      throw new HttpException('Failed to deploy Item contract', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
}
