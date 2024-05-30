import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { PassportModule } from '@nestjs/passport'
import { ApiKeyStratege } from './strategy/apiKey-strategy'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ApiKey } from '../database/entities/api-key.entity'
import { Application } from '../database/entities/application.entity'

@Module({
  imports: [PassportModule, TypeOrmModule.forFeature([ApiKey, Application])],
  providers: [AuthService, ApiKeyStratege],
  exports: [AuthService]
})
export class AuthModule {}
