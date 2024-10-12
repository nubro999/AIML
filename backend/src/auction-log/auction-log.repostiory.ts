import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { AuctionLog } from "./auction-log.entity";

@Injectable()
export class AuctionLogRepository extends Repository<AuctionLog>{
    constructor(dataSource: DataSource) {
        super(AuctionLog, dataSource.createEntityManager());
    }
    async findById(id: number): Promise<AuctionLog | null> {
        return this.findOne({ where: { id } });
    }

    
    

}