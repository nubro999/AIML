import { Module } from '@nestjs/common';
import { PriceFeed } from './pricefeed';

@Module({

    providers: [PriceFeed]
})
export class PricefeedModule {}
