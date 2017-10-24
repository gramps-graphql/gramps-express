import shell from 'shelljs';

jest.mock('shelljs', () => ({
  cd: jest.fn(),
  cp: jest.fn(),
  echo: jest.fn(),
  exec: jest.fn(),
  ln: jest.fn(),
  mkdir: jest.fn(),
  rm: jest.fn(),
  ShellString: jest.fn(),
  touch: jest.fn(),
}));

describe('GrAMPS CLI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('properly starts a dev server in mock mode', () => {
    require('../bin/gramps');

    expect(shell.exec).toHaveBeenCalledWith(
      ' GRAMPS_MODE=mock node dist/dev/server.js',
    );
    expect(shell.echo).not.toHaveBeenCalledWith(
      expect.stringMatching(/-> created an empty temporary directory/),
    );
  });

  it('properly starts a dev server in mock mode with local data sources');

  it('properly starts a dev server in live mode');

  it('properly starts a dev server in live mode with local data sources');

  it.skip('prints an error if an invalid data source is supplied', () => {
    // TODO how do we mock CLI commands while also mocking shelljs?
    require('../bin/gramps');

    expect(shell.echo).toHaveBeenCalledWith(
      expect.stringMatching(/Data source nogood does not exist./),
    );
  });
});
