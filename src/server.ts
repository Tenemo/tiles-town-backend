import { setupLogging } from './logging';
import express from 'express';
import cookieParser from 'cookie-parser';
import routes from 'routes/index.route';
import { config } from './config';
import cors from 'cors';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(cookieParser());

app.use('/api', routes);

setupLogging(app);

export const server = app.listen(config.port, () => {
    console.log(
        `Server running on port ${config.port} in ${config.env} environment`,
    );
});
