// Mock UUID module
// When imported as: import { v4, v5 } from 'uuid'
const v4 = jest.fn(() => '00000000-0000-0000-0000-000000000000')
const v5 = jest.fn(() => '00000000-0000-0000-0000-000000000000')
v5.URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8'

module.exports = { v4, v5 }
