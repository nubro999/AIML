import { Injectable } from "@nestjs/common";
import { Pump } from "./pump.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class PumpRepository extends Repository<Pump>{
    constructor(dataSource: DataSource) {
        super(Pump, dataSource.createEntityManager());
    }

    

}