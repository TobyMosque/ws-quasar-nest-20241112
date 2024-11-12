import * as express from 'express';
import configure from './index';

async function bootstrap() {
  const app = express()
  const nest = await configure({ app });
  await nest.listen(process.env.PORT || 3000);
}
bootstrap();
