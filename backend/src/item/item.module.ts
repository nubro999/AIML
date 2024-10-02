import { Module } from '@nestjs/common';
import { ItemRepository } from './item.repository';
import { ItemService } from './item.service';
import { ItemsController } from './item.controller';

@Module({
    providers:[ItemRepository, ItemService],
    controllers: [ItemsController]

})
export class ItemsModule {}
