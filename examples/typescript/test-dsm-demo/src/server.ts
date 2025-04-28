import 'dotenv/config';
import app from "./app";
import { initDbPool } from './clients/db';

initDbPool({
  // @ts-ignore
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  // @ts-ignore
  user: process.env.POSTGRES_USER,
  // @ts-ignore
  password: process.env.POSTGRES_PASSWORD,
  // @ts-ignore
  database: process.env.POSTGRES_DB,
});

app.listen(3000, () => {
  console.log(`Server is running`);
});
