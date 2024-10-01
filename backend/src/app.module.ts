import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItemsModule } from './item/item.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsController } from './item/item.controller';
import { ItemService } from './item/item.service';
import { AuctionLogsModule } from './auction-log/auction-log.module';
import { AuctionLog } from './auction-log/auction-log.entity';
import { Item } from './item/item.entity';

// B62qo23u5UYxJTw4Tni1pLLEHzTQEhh5fNSghHtkQowzNmQHrkJPSBk
@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'silentauction',
    entities: [Item, AuctionLog],
    synchronize: true,
  }), ItemsModule, AuctionLogsModule, ],
  controllers: [AppController, ItemsController],
  providers: [AppService, ItemService],
})
export class AppModule {}
