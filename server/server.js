import { config } from '../config/config';
import app from '../config/express.js';
import db from '../config/sequelize'; // eslint-disable-line no-unused-vars

app.listen(config.port, () => {
    console.log('Server running at http://127.0.0.1:' + config.port + ' in ' + config.env + ' environment'); // eslint-disable-line no-console
});

export default app;
