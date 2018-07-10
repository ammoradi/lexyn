import resource from 'resource-router-middleware';
import {handleParsing} from './../services/lexyn/parser'
import fs from 'fs'

export default ({ config, db }) => resource({

	/** GET / - List all entities */
	index(req, res) {
		// res.send(parser)
		let method = req.query ? req.query.method : null
		let input = req.query ? req.query.input : null
		let fetched = {}
		if (method) {
            fs.readFile('src/assets/grammar_lr.txt', 'ascii', function (err, data) {
                if (err) {
                    return console.log(err);
                }
                res.send(JSON.stringify({data: handleParsing(data, method, input || null)}))
            });
		}
		else {
			fetched = 'query is wrong'
            res.error(fetched)
        }
	},

    /** POST / - Create a new entity */
    create(req, res) {
        let method = req.body.method ? req.body.method : null
        let input = req.body.input ? req.body.input : null
        res.send(JSON.stringify({data: handleParsing(req.body.grammar, method, input || null)}))
    },
});
