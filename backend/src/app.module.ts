import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MinaModule } from './mina/mina.module';

import { TypeOrmModule } from '@nestjs/typeorm';


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
  }), MinaModule, ],
  controllers: [],
  providers: [],
})
export class AppModule {}
