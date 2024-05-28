import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import helmet from 'helmet'
import { ApiKeyAuthGuard } from './auth/guard/apiKey-auth.guard'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // Security
  app.useGlobalGuards(new ApiKeyAuthGuard())
  app.enableCors()
  app.use(helmet())

  // 接口版本控制
  app.enableVersioning({
    type: VersioningType.URI
  })
  // Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('Organize Simple API')
    .setDescription(
      'Organize Simple is an API that allows you data in a way that is easy to use and understand with the power of large language models'
    )
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-KEY',
        in: 'header'
      },
      'apiKey'
    )
    .addTag('organize-simple')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/doc', app, document)

  app.useGlobalPipes(new ValidationPipe())
  await app.listen(3000)
}
bootstrap()
