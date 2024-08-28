import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MinaModule } from './mina/mina.module';
import { PumpModule } from './pump/pump.module';
import { PumpController } from './pump/pump.controller';
import { PumpService } from './pump/pump.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pump } from './pump/pump.entity';
import { PumpRepository } from './pump/pump.repository';
import { PricefeedModule } from './pricefeed/pricefeed.module';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'pumpz',
    entities: [Pump],
    synchronize: true,
  }), MinaModule, PumpModule, UserModule, PricefeedModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
