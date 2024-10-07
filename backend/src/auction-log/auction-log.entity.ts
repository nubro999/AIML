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

  @Column('decimal', { precision: 10, scale: 2 })
  bidAmount: number;

  @Column({ length: 100 })
  bidderName: string;

  @CreateDateColumn()
  bidTime: Date;

}
