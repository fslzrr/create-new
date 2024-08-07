const { execSync } = require('node:child_process');
const path = require('node:path');
const semver = require('semver');

function log(...args) {
	console.log('publisherr: ', ...args);
}

/**
 * logs and executes command
 * @param {string} command
 */
function exec(command) {
	log('running', `'${command}'`);
	return execSync(command);
}

/**
 * gets pull request relevant branches
 * @returns {{
 *  defaultBranch: string;
 *  baseBranch: string;
 *  currentBranch: string;
 * }}
 */
function getBranches() {
	const {
		GITHUB_DEFAULT_BRANCH = 'default-branch', // provided in pipeline
		GITHUB_BASE_REF = 'base-branch', // pr
		GITHUB_HEAD_REF = 'current-branch', // pr
		GITHUB_REF_NAME, // manual
	} = process.env;

	return {
		defaultBranch: GITHUB_DEFAULT_BRANCH,
		baseBranch: GITHUB_BASE_REF,
		currentBranch:
			GITHUB_REF_NAME === GITHUB_DEFAULT_BRANCH
				? GITHUB_REF_NAME
				: GITHUB_HEAD_REF,
	};
}

/**
 * read and parse package.json file
 * @returns {object}
 */
function readPackageJson() {
	const packageJsonString = exec(
		`cat ${path.resolve(process.cwd(), 'package.json')}`,
	).toString();
	const packageJson = JSON.parse(packageJsonString);
	return packageJson;
}

/**
 * formats branch into a valid dist tag
 * @param {string} currentBranch
 * @returns {string}
 */
function getBranchTag(currentBranch) {
	return currentBranch
		.toLowerCase()
		.replace(/[^a-zA-Z\d:]/g, '-')
		.replace(/^-|-$/g, '');
}

/**
 * get registry dist-tag current version
 * @param {string} packageName
 * @param {string} tag
 * @returns {string}
 */
function getPackageCurrentVersion(packageName, tag) {
	try {
		const packageViewString = exec(
			`pnpm view ${packageName} dist-tags --json`,
		).toString();
		const distTags = JSON.parse(packageViewString);

		if (distTags[tag]) {
			return distTags[tag];
		}

		if (distTags.latest) {
			log(`dist-tag '${tag}' was not found`);
			log(`defaulting to 'latest' version`);
			return distTags.latest;
		}

		log(`dist-tag 'latests' was not found`);
		log(`current version defaulting to version '0.0.0'`);
		return '0.0.0';
	} catch (_) {
		log('package was not found in registry');
		log(`current version defaulting to version '0.0.0'`);
		return '0.0.0';
	}
}

/**
 * gets package current version by dist tag
 * @param {string} tag
 * @returns {string}
 */
function getCurrentVersion(tag) {
	const packageJson = readPackageJson();
	const currentVersion = getPackageCurrentVersion(packageJson.name, tag);
	return currentVersion;
}

/**
 * updates package.json version
 * @param {string} version
 */
function bumpPackageVersionUp(version) {
	exec(`pnpm version ${version} --no-git-tag-version`);
}

/**
 * publishes package to registry
 * @param {string} tag
 */
function publishToRegistry(tag) {
	exec(`pnpm publish --tag ${tag} --no-git-checks --access=public`);
}

/**
 * publish alpha version
 * @param {string} currentBranch
 */
function publishAlpha(currentBranch) {
	log('publishing alpha version');
	const branchTag = getBranchTag(currentBranch);
	const currentVersion = getCurrentVersion(branchTag);
	const nextAlphaVersion = semver.inc(currentVersion, 'prerelease', branchTag);
	bumpPackageVersionUp(nextAlphaVersion);
	publishToRegistry(branchTag);
}

/**
 * returns the release type
 * @returns {'patch' | 'minor' | 'major'}
 */
function getReleaseType() {
	const { RELEASE_TYPE = 'patch' } = process.env;
	return RELEASE_TYPE;
}

/**
 * publish latest version
 * @returns
 */
function publishLatest() {
	log('publishing latest version');
	const packageJson = readPackageJson();
	const releaseType = getReleaseType();
	const nextLatestVersion = semver.inc(packageJson.version, releaseType);
	bumpPackageVersionUp(nextLatestVersion);
	publishToRegistry('latest');
}

function publish() {
	const { defaultBranch, baseBranch, currentBranch } = getBranches();

	if (currentBranch === defaultBranch) {
		publishLatest();
		return;
	}

	if (baseBranch === defaultBranch) {
		publishAlpha(currentBranch);
	}
}

// just handling alpha versions
publish();
