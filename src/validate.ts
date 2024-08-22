import type { ProgramCLI } from './parse';

type Program = {
	arguments: ['lib', string];
};

function validateProgram(program: ProgramCLI): Program {
	if (program.arguments.length === 0) {
		throw new Error('Missing command');
	}

	const [command, ...args] = program.arguments;
	if (command === 'lib') {
		const [name] = args;
		if (!name) {
			throw new Error('Missing <name> argument');
		}

		return { arguments: [command, name] };
	}

	throw new Error('Invalid command');
}

export function validate(program: ProgramCLI) {
	try {
		validateProgram(program);
	} catch (error) {
		const e = error as Error;
		console.error(e.message);
		process.exit(1);
	}

	return program;
}
