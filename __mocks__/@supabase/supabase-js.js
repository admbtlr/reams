const createClient = jest.fn(() => ({
    auth: {
      getSession: () => ({
        data: {
          session: {
            user: {
              id: '1'
            }
          }
        }
      })
    },
    from: jest.fn(() => ({
      select: () => ({
        eq: jest.fn(() => ({})),
        in: jest.fn((label, ids) => ({})),
        error: null,
        data: []
      })
    }))
  }))

export {
  createClient
}