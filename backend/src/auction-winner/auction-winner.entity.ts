// src/auction-winner/auction-winner.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Item } from '../item/item.entity';

@Entity()
export class AuctionWinner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  winningBid: number;

  @Column()
  winTime: Date;

  @OneToOne(() => Item, item => item.auctionWinner)
  @JoinColumn()
  auctionItem: Item;
}
