import { AfterLoad, AfterUpdate, Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('media')
export class MediaEntity {
  @PrimaryColumn()
  uuid: string;

  @Column()
  key: string;

  @Column()
  extension: string;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  fileName: string;

  @AfterLoad()
  @AfterUpdate()
  setFileName() {
    this.fileName = `${this.key}/${this.uuid}.${this.extension}`;
  }
}
