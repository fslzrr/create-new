import { parse } from './parse';
import { validate } from './validate';

export default function main() {
	const cli = parse(process.argv);
	const program = validate(cli);
	console.log(program);
}
