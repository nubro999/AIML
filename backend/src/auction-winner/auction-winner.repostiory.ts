import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { AuctionWinner } from "./auction-winner.entity";

@Injectable()
export class AuctionWinnerRepository extends Repository<AuctionWinner>{
    constructor(dataSource: DataSource) {
        super(AuctionWinner, dataSource.createEntityManager());
    }
    async findById(id: number): Promise<AuctionWinner | null> {
        return this.findOne({ where: { id } });
    }
    

}