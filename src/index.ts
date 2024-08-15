import { parse } from './parse';

export default function main() {
	const program = parse(process.argv);
	console.log(program);
}
