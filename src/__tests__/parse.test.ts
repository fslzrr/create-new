import { parse } from '../parse';

describe('parse', () => {
	const DEFAULT_ARGS = ['node:bin', 'node:fie'];

	function makeCommand(cmd: string[]) {
		return [...DEFAULT_ARGS, ...cmd];
	}

	it('handles empty args', () => {
		const program = parse([]);

		expect(program.command).toBe(undefined);
		expect(program.arguments).toBe(undefined);
		expect(program.options).toBe(undefined);
	});

	it('ignores first two args', () => {
		const program = parse(makeCommand([]));

		expect(program.command).toBe(undefined);
		expect(program.arguments).toBe(undefined);
		expect(program.options).toBe(undefined);
	});

	it('handles command', () => {
		const program = parse(makeCommand(['package']));

		expect(program.command).toBe('package');
		expect(program.arguments).toBe(undefined);
		expect(program.options).toBe(undefined);
	});

	it('handles single argument', () => {
		const program = parse(makeCommand(['package', '@fszlrr/publisherr']));

		expect(program.command).toBe('package');
		expect(program.arguments?.length).toBe(1);
		expect(program.arguments?.[0]).toBe('@fszlrr/publisherr');
		expect(program.options).toBe(undefined);
	});

	it('handles multiple arguments', () => {
		const program = parse(
			makeCommand(['package', '@fszlrr/publisherr', 'typescript']),
		);

		expect(program.command).toBe('package');
		expect(program.arguments?.length).toBe(2);
		expect(program.arguments?.[0]).toBe('@fszlrr/publisherr');
		expect(program.arguments?.[1]).toBe('typescript');
		expect(program.options).toBe(undefined);
	});

	it('handles single short flag', () => {
		const program = parse(makeCommand(['-f']));

		expect(program.command).toBe(undefined);
		expect(program.arguments).toBe(undefined);
		expect(program.options?.f).toBe(true);
	});

	it('handles multiple short flags', () => {
		const program = parse(makeCommand(['-f', '-s', '-v']));

		expect(program.command).toBe(undefined);
		expect(program.arguments).toBe(undefined);
		expect(program.options?.f).toBe(true);
		expect(program.options?.s).toBe(true);
		expect(program.options?.v).toBe(true);
	});

	it('handles single short flag (short syntax)', () => {
		const program = parse(makeCommand(['-fsv']));

		expect(program.command).toBe(undefined);
		expect(program.arguments).toBe(undefined);
		expect(program.options?.f).toBe(true);
		expect(program.options?.s).toBe(true);
		expect(program.options?.v).toBe(true);
	});

	it('handles multiple short flags (short syntax)', () => {
		const program = parse(makeCommand(['-fsv', '-abc']));

		expect(program.command).toBe(undefined);
		expect(program.arguments).toBe(undefined);
		expect(program.options?.f).toBe(true);
		expect(program.options?.s).toBe(true);
		expect(program.options?.v).toBe(true);
		expect(program.options?.a).toBe(true);
		expect(program.options?.b).toBe(true);
		expect(program.options?.c).toBe(true);
	});

	it('handles single long flag', () => {
		const program = parse(makeCommand(['--help']));

		expect(program.command).toBe(undefined);
		expect(program.arguments).toBe(undefined);
		expect(program.options?.help).toBe(true);
	});

	it('handles multiple long flags', () => {
		const program = parse(
			makeCommand(['--help', '--me', '--pls', '--im-tired']),
		);

		expect(program.command).toBe(undefined);
		expect(program.arguments).toBe(undefined);
		expect(program.options?.help).toBe(true);
		expect(program.options?.me).toBe(true);
		expect(program.options?.pls).toBe(true);
		expect(program.options?.['im-tired']).toBe(true);
	});

	it('handles single short option', () => {
		const program = parse(makeCommand(['-l=typescript']));

		expect(program.command).toBe(undefined);
		expect(program.arguments).toBe(undefined);
		expect(program.options?.l).toBe('typescript');
	});

	it('handles multiple short options', () => {
		const program = parse(makeCommand(['-l=typescript', '-p=pnpm']));

		expect(program.command).toBe(undefined);
		expect(program.arguments).toBe(undefined);
		expect(program.options?.l).toBe('typescript');
		expect(program.options?.p).toBe('pnpm');
	});

	it('handles short option with double quotes', () => {
		const program = parse(makeCommand(['-l="Some Programming Language"']));

		expect(program.command).toBe(undefined);
		expect(program.arguments).toBe(undefined);
		expect(program.options?.l).toBe('Some Programming Language');
	});

	it('handles short option with single quotes', () => {
		const program = parse(makeCommand([`-l='Some Programming Language'`]));

		expect(program.command).toBe(undefined);
		expect(program.arguments).toBe(undefined);
		expect(program.options?.l).toBe('Some Programming Language');
	});

	it('handles single long option', () => {
		const program = parse(makeCommand(['--language=typescript']));

		expect(program.command).toBe(undefined);
		expect(program.arguments).toBe(undefined);
		expect(program.options?.language).toBe('typescript');
	});

	it('handles multiple long options', () => {
		const program = parse(
			makeCommand(['--language=typescript', '--package-manager=pnpm']),
		);

		expect(program.command).toBe(undefined);
		expect(program.arguments).toBe(undefined);
		expect(program.options?.language).toBe('typescript');
		expect(program.options?.['package-manager']).toBe('pnpm');
	});

	it('handles long option with double quotes', () => {
		const program = parse(
			makeCommand(['--language="Some Programming Language"']),
		);

		expect(program.command).toBe(undefined);
		expect(program.arguments).toBe(undefined);
		expect(program.options?.language).toBe('Some Programming Language');
	});

	it('handles long option with single quotes', () => {
		const program = parse(
			makeCommand([`--language='Some Programming Language'`]),
		);

		expect(program.command).toBe(undefined);
		expect(program.arguments).toBe(undefined);
		expect(program.options?.language).toBe('Some Programming Language');
	});

	it('handles everything everywhere all at once', () => {
		const program = parse(
			makeCommand([
				'kitchensink',
				'super-long-test',
				'-wi',
				'-t',
				'-h',
				'-e=Everywhere',
				'--all="At once"',
			]),
		);

		expect(program.command).toBe('kitchensink');
		expect(program.arguments?.length).toBe(1);
		expect(program.arguments?.[0]).toBe('super-long-test');
		expect(program.options?.w).toBe(true);
		expect(program.options?.i).toBe(true);
		expect(program.options?.t).toBe(true);
		expect(program.options?.h).toBe(true);
		expect(program.options?.e).toBe('Everywhere');
		expect(program.options?.all).toBe('At once');
	});
});
