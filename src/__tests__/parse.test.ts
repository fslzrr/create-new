import { parse } from '../parse';

describe('parse', () => {
	const DEFAULT_ARGS = ['node:bin', 'node:fie'];

	function makeCommand(cmd: string[]) {
		return [...DEFAULT_ARGS, ...cmd];
	}

	describe('arguments', () => {
		it('handles empty args', () => {
			const program = parse([]);

			expect(program.arguments.length).toBe(0);
			expect(Object.keys(program.options).length).toBe(0);
		});

		it('ignores first two args', () => {
			const program = parse(makeCommand([]));

			expect(program.arguments.length).toBe(0);
			expect(Object.keys(program.options).length).toBe(0);
		});

		it('handles command', () => {
			const program = parse(makeCommand(['package']));

			expect(program.arguments[0]).toBe('package');
			expect(Object.keys(program.options).length).toBe(0);
		});

		it('handles single argument', () => {
			const program = parse(makeCommand(['package', '@fszlrr/publisherr']));

			expect(program.arguments.length).toBe(2);
			expect(program.arguments[0]).toBe('package');
			expect(program.arguments[1]).toBe('@fszlrr/publisherr');
			expect(Object.keys(program.options).length).toBe(0);
		});

		it('handles multiple arguments', () => {
			const program = parse(
				makeCommand(['package', '@fszlrr/publisherr', 'typescript']),
			);

			expect(program.arguments.length).toBe(3);
			expect(program.arguments[0]).toBe('package');
			expect(program.arguments[1]).toBe('@fszlrr/publisherr');
			expect(program.arguments[2]).toBe('typescript');
			expect(Object.keys(program.options).length).toBe(0);
		});

		it('handles incorrect short flag as argument', () => {
			const program = parse(makeCommand(['-f-']));

			expect(program.arguments.length).toBe(1);
			expect(program.arguments[0]).toBe('-f-');
			expect(Object.keys(program.options).length).toBe(0);
		});

		it('handles incorrect long flag as argument', () => {
			const program = parse(makeCommand(['--long--flag', '--long-flag-']));

			expect(program.arguments.length).toBe(2);
			expect(program.arguments[0]).toBe('--long--flag');
			expect(program.arguments[1]).toBe('--long-flag-');
			expect(Object.keys(program.options).length).toBe(0);
		});

		it('handles incorrect short option as argument', () => {
			const program = parse(makeCommand(['-f-=abcdef']));

			expect(program.arguments.length).toBe(1);
			expect(program.arguments[0]).toBe('-f-=abcdef');
			expect(Object.keys(program.options).length).toBe(0);
		});

		it('handles incorrect long option as argument', () => {
			const program = parse(
				makeCommand(['--long--flag=asx--asx', '--long-flag-="asx--asx"']),
			);

			expect(program.arguments.length).toBe(2);
			expect(program.arguments[0]).toBe('--long--flag=asx--asx');
			expect(program.arguments[1]).toBe('--long-flag-="asx--asx"');
			expect(Object.keys(program.options).length).toBe(0);
		});
	});

	describe('short flag', () => {
		it('handles single short flag', () => {
			const program = parse(makeCommand(['-f']));

			expect(program.arguments.length).toBe(0);
			expect(program.options.f).toBe(true);
		});

		it('handles multiple short flags', () => {
			const program = parse(makeCommand(['-f', '-s', '-v']));

			expect(program.arguments.length).toBe(0);
			expect(program.options.f).toBe(true);
			expect(program.options.s).toBe(true);
			expect(program.options.v).toBe(true);
		});

		it('handles single short flag (short syntax)', () => {
			const program = parse(makeCommand(['-fsv']));

			expect(program.arguments.length).toBe(0);
			expect(program.options.f).toBe(true);
			expect(program.options.s).toBe(true);
			expect(program.options.v).toBe(true);
		});

		it('handles multiple short flags (short syntax)', () => {
			const program = parse(makeCommand(['-fsv', '-abc']));

			expect(program.arguments.length).toBe(0);
			expect(program.options.f).toBe(true);
			expect(program.options.s).toBe(true);
			expect(program.options.v).toBe(true);
			expect(program.options.a).toBe(true);
			expect(program.options.b).toBe(true);
			expect(program.options.c).toBe(true);
		});
	});

	describe('long flag', () => {
		it('handles single long flag', () => {
			const program = parse(makeCommand(['--help']));

			expect(program.arguments.length).toBe(0);
			expect(program.options.help).toBe(true);
		});

		it('handles multiple long flags', () => {
			const program = parse(
				makeCommand(['--help', '--me', '--pls', '--im-tired']),
			);

			expect(program.arguments.length).toBe(0);
			expect(program.options.help).toBe(true);
			expect(program.options.me).toBe(true);
			expect(program.options.pls).toBe(true);
			expect(program.options['im-tired']).toBe(true);
		});
	});

	describe('short option', () => {
		it('handles single short option', () => {
			const program = parse(makeCommand(['-l=typescript']));

			expect(program.arguments.length).toBe(0);
			expect(program.options.l).toBe('typescript');
		});

		it('handles multiple short options', () => {
			const program = parse(makeCommand(['-l=typescript', '-p=pnpm']));

			expect(program.arguments.length).toBe(0);
			expect(program.options.l).toBe('typescript');
			expect(program.options.p).toBe('pnpm');
		});

		it('handles short option with double quotes', () => {
			const program = parse(makeCommand(['-l="Some Programming Language"']));

			expect(program.arguments.length).toBe(0);
			expect(program.options.l).toBe('Some Programming Language');
		});

		it('handles short option with single quotes', () => {
			const program = parse(makeCommand([`-l='Some Programming Language'`]));

			expect(program.arguments.length).toBe(0);
			expect(program.options.l).toBe('Some Programming Language');
		});
	});

	describe('long option', () => {
		it('handles single long option', () => {
			const program = parse(makeCommand(['--language=typescript']));

			expect(program.arguments.length).toBe(0);
			expect(program.options.language).toBe('typescript');
		});

		it('handles multiple long options', () => {
			const program = parse(
				makeCommand(['--language=typescript', '--package-manager=pnpm']),
			);

			expect(program.arguments.length).toBe(0);
			expect(program.options.language).toBe('typescript');
			expect(program.options['package-manager']).toBe('pnpm');
		});

		it('handles long option with double quotes', () => {
			const program = parse(
				makeCommand(['--language="Some Programming Language"']),
			);

			expect(program.arguments.length).toBe(0);
			expect(program.options.language).toBe('Some Programming Language');
		});

		it('handles long option with single quotes', () => {
			const program = parse(
				makeCommand([`--language='Some Programming Language'`]),
			);

			expect(program.arguments.length).toBe(0);
			expect(program.options.language).toBe('Some Programming Language');
		});
	});

	describe('kitchensink', () => {
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

			expect(program.arguments.length).toBe(2);
			expect(program.arguments[0]).toBe('kitchensink');
			expect(program.arguments[1]).toBe('super-long-test');
			expect(program.options.w).toBe(true);
			expect(program.options.i).toBe(true);
			expect(program.options.t).toBe(true);
			expect(program.options.h).toBe(true);
			expect(program.options.e).toBe('Everywhere');
			expect(program.options.all).toBe('At once');
		});
	});
});
