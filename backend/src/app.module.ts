import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItemsModule } from './items/items.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsController } from './items/items.controller';
import { ItemService } from './items/items.service';

// B62qo23u5UYxJTw4Tni1pLLEHzTQEhh5fNSghHtkQowzNmQHrkJPSBk
@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'silentauction',
    entities: [],
    synchronize: true,
  }), ItemsModule, ],
  controllers: [AppController, ItemsController],
  providers: [AppService, ItemService],
})
export class AppModule {}
