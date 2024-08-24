import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MinaModule } from './mina/mina.module';
import { PumpModule } from './pump/pump.module';
import { PumpController } from './pump/pump.controller';
import { PumpService } from './pump/pump.service';

@Module({
  imports: [MinaModule, PumpModule],
  controllers: [AppController, PumpController],
  providers: [AppService, PumpService],
})
export class AppModule {}
