import { Express, Request, Response } from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

interface RenderParams {
  req: Request;
  res: Response;
}

interface ConfigureParams {
  app: Express;
  render?: (params: RenderParams) => Promise<void>;
}

async function bootstrap({
  app: server,
  render,
}: ConfigureParams) {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(server));
  
  app.setGlobalPrefix('api');
  app.useGlobalFilters({
    async catch(exception, host) {
      console.log(exception)
      const ctx = host.switchToHttp();
      const status = exception.getStatus() as number;
      const next = ctx.getNext();
      console.log(status, render)
      if (status === 404 && render) {
        const req = ctx.getRequest<Request>();
        const res = ctx.getResponse<Response>();
        await render({ req, res });
      } else {
        next();
      }
    },
  });
  
  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  return app;
}

export default bootstrap
export { bootstrap }