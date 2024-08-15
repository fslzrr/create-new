import { z } from 'zod';

const ShortNameCharsRegex = /[^a-zA-Z]/g;
const LongNameCharsRegex = /[^a-zA-Z\-]/g;

// FlagShort	Boolean
// `-a`
// `-abcd` -> `-a -b -c -d`
const FlagShortSchema = z.custom<`-${string}`>((data) => {
	if (typeof data !== 'string') {
		return false;
	}

	// shortest example: -x
	if (data.length < 2) {
		return false;
	}

	if (!data.startsWith('-')) {
		return false;
	}

	const flagName = data.slice(1);
	const matchArray = flagName.match(ShortNameCharsRegex);
	if (matchArray) {
		return false;
	}

	return true;
});

type FlagShort = z.infer<typeof FlagShortSchema>;

// FlagLong	Boolean
// `--help`
// `--help-me`
const FlagLongSchema = z.custom<`--${string}`>((data) => {
	if (typeof data !== 'string') {
		return false;
	}

	// shortest example: --x
	if (data.length < 3) {
		return false;
	}

	if (!data.startsWith('--')) {
		return false;
	}

	const flagName = data.slice(2);
	const matchArray = flagName.match(LongNameCharsRegex);
	if (matchArray) {
		return false;
	}

	return true;
});

type FlagLong = z.infer<typeof FlagLongSchema>;

// OptionShort	string
// `-t=this-value`
// `-t="this value"`
// `-t='this value'`
const OptionShortSchema = z.custom<`${FlagShort}=${string}`>((data) => {
	if (typeof data !== 'string') {
		return false;
	}

	// shortest example: -x=
	if (data.length < 3) {
		return false;
	}

	if (!data.startsWith('-')) {
		return false;
	}

	const [flag] = data.split('=');
	if (flag === data) {
		return false;
	}

	const flagShort = FlagShortSchema.safeParse(flag);

	return flagShort.success;
});

type OptionShort = z.infer<typeof OptionShortSchema>;

// OptionLog	String
// `--use=this-value`
// `--use="this value"`
// `--use='this value'`
const OptionLongSchema = z.custom<`${FlagLong}=${string}`>((data) => {
	if (typeof data !== 'string') {
		return false;
	}

	// shortest example: --x=
	if (data.length < 4) {
		return false;
	}

	if (!data.startsWith('--')) {
		return false;
	}

	const [flag] = data.split('=');
	if (flag === data) {
		return false;
	}

	const flagLong = FlagLongSchema.safeParse(flag);

	return flagLong.success;
});

type OptionLong = z.infer<typeof OptionLongSchema>;

function getFlagValues(option: FlagLong | FlagShort) {
	if (option.startsWith('--')) {
		return { name: option.slice(2) };
	}
	if (option.startsWith('-')) {
		return { name: option.slice(1) };
	}
	return { name: option };
}

function getOptionValues(option: OptionLong | OptionShort) {
	const [optionFlag, ...optionValue] = option.split('=');

	const { name } = getFlagValues(optionFlag as FlagLong | FlagShort);
	const value = optionValue.join('=').replace(/^\"|\"$|^'|'$/g, '');

	return { name, value };
}

type ProgramCLI = {
	command?: string;
	arguments?: string[];
	options?: Record<string, boolean | string>;
};

export function parse(args: string[]) {
	const usefulArgs = args.splice(2);

	const program = usefulArgs.reduce<ProgramCLI>(
		(p, arg) => {
			const optionLong = OptionLongSchema.safeParse(arg);
			if (optionLong.success) {
				const { name, value } = getOptionValues(optionLong.data);
				if (!p.options) {
					p.options = {};
				}

				p.options[name] = value;
				return p;
			}

			const optionShort = OptionShortSchema.safeParse(arg);
			if (optionShort.success) {
				const { name, value } = getOptionValues(optionShort.data);
				if (!p.options) {
					p.options = {};
				}

				p.options[name] = value;
				return p;
			}

			const flagLong = FlagLongSchema.safeParse(arg);
			if (flagLong.success) {
				const { name } = getFlagValues(flagLong.data);
				if (!p.options) {
					p.options = {};
				}

				p.options[name] = true;
				return p;
			}

			const flagShort = FlagShortSchema.safeParse(arg);
			if (flagShort.success) {
				const { name: names } = getFlagValues(flagShort.data);
				if (!p.options) {
					p.options = {};
				}

				for (const name of names.split('')) {
					p.options[name] = true;
				}

				return p;
			}

			if (!p.command) {
				p.command = arg;
				return p;
			}

			if (!p.arguments) {
				p.arguments = [];
			}
			p.arguments.push(arg);

			return p;
		},
		{
			command: undefined,
			arguments: undefined,
			options: undefined,
		},
	);

	return program;
}
