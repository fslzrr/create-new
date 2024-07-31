import createNewProject from '../index';

describe('index module', () => {
	it('default export is a function', () => {
		expect(typeof createNewProject).toBe('function');
	});
});
