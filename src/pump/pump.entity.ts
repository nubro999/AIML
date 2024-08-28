import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Pump {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tokenAddress: string;

  @Column()
  ammAddress: string;

  @Column()
  creator: string;

  @Column()
  name: string;

  @Column()
  symbol: string;
}