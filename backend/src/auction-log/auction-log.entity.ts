import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '../item/item.entity';



@Entity('auction_logs')
export class AuctionLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Item, item => item.auctionLogs)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column()
  key: number;

  @Column()
  bidUser: string;

  @Column()
  bidAmount: number;

  @Column({ length: 100 })
  transactionHash: string;

  @CreateDateColumn()
  bidTime: Date;


}
