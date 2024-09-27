import { Module } from '@nestjs/common';
import { Pump } from './pump.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PumpController } from './pump.controller';
import { PumpRepository } from './pump.repository';
import { PumpService } from './pump.service';

@Module({
    imports: [TypeOrmModule.forFeature([Pump])], //해방모듈에서 Cat Entity를 사용하기 위해 Import
    exports: [TypeOrmModule], // 다름 모듈에서도 CatModule의 데이터베이스 설정을 공유하기 위해 export
    controllers: [PumpController],
    providers: [PumpService, PumpRepository],

})
export class PumpModule {}
