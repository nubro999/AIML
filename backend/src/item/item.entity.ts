import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AuctionLog } from '../auction-log/auction-log.entity';
import { MerkleMap } from 'o1js';

@Entity('item')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column()
  merkleMap: String;

  @Column()
  merkleMapRoot: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  minimumPrice: number;

  @Column()
  endTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => AuctionLog, auctionLog => auctionLog.item)
  auctionLogs: AuctionLog[];

}
