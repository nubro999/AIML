import { Controller, Get, Post, HttpException, HttpStatus, Body, ValidationPipe } from '@nestjs/common';
import { ItemService } from './item.service';
import { MerkleMap } from 'o1js';
import { CreateItemDto } from './dto/create-item.dto';

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
      const result = await this.itemService.DeployMinaContract();
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

  @Get('/map')
  getMerkleMap(): string {
    const mmap = new MerkleMap();
    
    console.log(mmap.getRoot().toString())
    return "Hello from map";
  }

  @Post('/create')
  async createItem(@Body() createItemDto: CreateItemDto) {
    console.log("create")
    try {
      const newItem = await this.itemService.AddItem(createItemDto);
      return {
        message: 'Item created successfully',
        item: newItem,
      };
    } catch (error) {
      throw new Error(`Failed to create item: ${(error as Error).message}`);
    }
  }
  


}
  
