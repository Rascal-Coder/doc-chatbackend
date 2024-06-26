import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { ParsersModule } from './parsers/parsers.module'
import { LoggerModule } from './logger/logger.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 20
      }
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGES_HOST,
      port: 5466,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production'
    }),
    AuthModule,
    ParsersModule,
    LoggerModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
