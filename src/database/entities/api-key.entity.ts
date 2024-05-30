import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Application } from './application.entity'

@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string
  @OneToMany(() => Application, application => application.apiKeys)
  application: Promise<Application>
}
