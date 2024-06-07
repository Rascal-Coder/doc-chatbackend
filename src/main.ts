import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import helmet from 'helmet'
import { ApiKeyAuthGuard } from './auth/guard/apiKey-auth.guard'
import { AllExceptionsFilter, HttpExceptionFilter } from '@app/common/exceptions'
import { TransformInterceptor } from '@app/common/interceptors'
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // 全局返回参数
  app.useGlobalInterceptors(new TransformInterceptor())
  // 异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter())
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
        in: 'header',
        description: 'API key for authentication of registered applications'
      },
      'apiKey'
    )
    .addTag('organize-simple')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  app.useGlobalPipes(new ValidationPipe())
  await app.listen(3000)
}
bootstrap()
