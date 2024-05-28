import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { PassportModule } from '@nestjs/passport'
import { ApiKeyStratege } from './strategy/apiKey-strategy'

@Module({
  imports: [PassportModule],
  providers: [AuthService, ApiKeyStratege],
  exports: [AuthService]
})
export class AuthModule {}
