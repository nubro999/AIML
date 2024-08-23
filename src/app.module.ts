import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MinaModule } from './mina/mina.module';
import { PumpModule } from './pump/pump.module';

@Module({
  imports: [MinaModule, PumpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
