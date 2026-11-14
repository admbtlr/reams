const existsMock = jest.fn();
existsMock.mockReturnValueOnce({ then: jest.fn() });

export default {
  DocumentDir: () => {},
  ImageCache: {
    get: {
      clear: () => {},
    },
  },
  fs: {
    exists: existsMock,
    dirs: {
      MainBundleDir: () => {},
      CacheDir: '/tmp/cache',
      DocumentDir: '/tmp/docs',
    },
    readFile: jest.fn(() => Promise.resolve('')),
    writeFile: jest.fn(() => Promise.resolve()),
    unlink: jest.fn(() => Promise.resolve()),
    mkdir: jest.fn(() => Promise.resolve()),
  },
  config: jest.fn(() => ({
    fetch: jest.fn(() => Promise.resolve({ data: '' })),
  })),
};
