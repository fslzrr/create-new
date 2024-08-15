import { z } from 'zod';

const CreateNewProgramSchema = z.object({
	command: z.literal('lib', {
		errorMap: (issue, ctx) => {
			if (!ctx.data) {
				return { message: 'Missing command' };
			}
			if (issue.code === 'invalid_literal') {
				return { message: `Invalid command "${ctx.data}"` };
			}
			return { message: ctx.defaultError };
		},
	}),
	arguments: z.tuple(
		[
			z.string().min(1, {
				message: 'Argument is empty',
			}),
		],
		{
			required_error: 'Missing arguments',
		},
	),
});

export function validate(program: unknown) {
	const parsedProgram = CreateNewProgramSchema.safeParse(program);
	if (!parsedProgram.success) {
		const { message } = parsedProgram.error.errors[0];
		console.error(message);
		process.exit(1);
	}

	return parsedProgram.data;
}
