import { Module } from '@nestjs/common';
import { AuctionWinnerRepository } from './auction-winner.repostiory';
import { AuctionWinnerService } from './auction-winner.service';
import { ItemService } from '../item/item.service';
import { AuctionLogRepository } from '../auction-log/auction-log.repostiory';
import { ItemRepository } from '../item/item.repository';

@Module({
    providers:[AuctionWinnerRepository, AuctionLogRepository , ItemRepository ,AuctionWinnerService, ItemService ],

})
export class AuctionWinnerModule {}
