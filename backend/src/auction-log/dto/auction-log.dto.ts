import { IsNumber, IsString, IsDecimal } from 'class-validator';

export class AuctionLogDto {
    
    @IsNumber()
    itemId: number;

    @IsNumber()
    key: number;

    @IsDecimal()
    bidAmount: number;
    
    @IsString()
    bidUser: string;

    @IsString()
    transactionHash: string;
}
