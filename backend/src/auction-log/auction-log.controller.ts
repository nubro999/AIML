import { Controller, Get, Post, HttpException, HttpStatus, Body, ValidationPipe, Param } from '@nestjs/common';
import { AuctionLogRepository } from './auction-log.repostiory';
import { ItemRepository } from '../item/item.repository';
import { AuctionLogDto } from './dto/auction-log.dto';
import { AuctionLog } from './auction-log.entity';

@Controller('auction-log')
export class AuctionLogController {

constructor(
    private readonly auctionLogRepository: AuctionLogRepository,
    private readonly itemRepository: ItemRepository
    ) {}
    

  @Get()
  getHello(): string {
    return "Hello from  AuctionLogController!";
  }


  @Post('add')
  async addAuctionLog(@Body() auctionLogDto: AuctionLogDto): Promise<string> {

    console.log("addAuctionLog")
    try {
      const item = await this.itemRepository.findById(auctionLogDto.itemId);
      
      if (!item) {
        throw new Error(`Item with id ${auctionLogDto.itemId} not found`);
      }

      const auctionLog = new AuctionLog();
      auctionLog.item = item;
      auctionLog.key = auctionLogDto.key;
      auctionLog.bidUser = auctionLogDto.bidUser;
      auctionLog.bidAmount = auctionLogDto.bidAmount;
      auctionLog.transactionHash = auctionLogDto.transactionHash;

      await this.auctionLogRepository.save(auctionLog);

      return `Auction log saved for item ${auctionLogDto.itemId} with bid amount ${auctionLogDto.bidAmount}`;
    } catch (error) {
      console.error('Error saving auction log:', error);
      throw new Error('Failed to save auction log');
    }
  }





}

  
