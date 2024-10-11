import { Module } from '@nestjs/common';
import { AuctionLogRepository } from './auction-log.repostiory';
import { AuctionLogService } from './auction-log.service';
import { AuctionLogController } from './auction-log.controller';
import { ItemRepository } from '../item/item.repository';

@Module({

    providers:[AuctionLogRepository, AuctionLogService, ItemRepository],
    controllers: [AuctionLogController]
})
export class AuctionLogsModule {}
