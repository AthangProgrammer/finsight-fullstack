import { Sequelize } from 'sequelize';
import configs from './config.cjs';

const settings = configs[process.env.NODE_ENV] ?? configs.development;

export const sequelize = new Sequelize(process.env[settings.use_env_variable], settings);
