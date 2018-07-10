import { version } from '../../package.json';
import { Router } from 'express';
import tokenizer from './tokenizer';
import parser from './parser';

export default ({ config, db }) => {
	let api = Router();

	api.use('/tokenizer', tokenizer({ config, db }));
	api.use('/parser', parser({ config, db }));

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}
