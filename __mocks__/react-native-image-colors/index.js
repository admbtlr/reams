export default {
  getColors: jest.fn(() => Promise.resolve({ primary: '#000000', secondary: '#ffffff' })),
}