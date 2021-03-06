import { sqltag, empty, join, Sql } from './index'

describe('sql template tag', () => {
  it('should generate sql', () => {
    const query = sqltag`SELECT * FROM books`

    expect(query.sql).toEqual('SELECT * FROM books')
    expect(query.text).toEqual('SELECT * FROM books')
    expect(query.values).toEqual([])
  })

  it('should store values', () => {
    const name = 'Blake'
    const query = sqltag`SELECT * FROM books WHERE author = ${name}`

    expect(query.sql).toEqual('SELECT * FROM books WHERE author = ?')
    expect(query.text).toEqual('SELECT * FROM books WHERE author = $1')
    expect(query.values).toEqual([name])
  })

  it('should build sql with child sql statements', () => {
    const subquery = sqltag`SELECT id FROM authors WHERE name = ${'Blake'}`
    const query = sqltag`SELECT * FROM books WHERE author_id IN (${subquery})`

    expect(query.text).toEqual(
      'SELECT * FROM books WHERE author_id IN (SELECT id FROM authors WHERE name = $1)'
    )
    expect(query.values).toEqual(['Blake'])
  })

  it('should not cache values for mysql compatibility', () => {
    const ids = [1, 2, 3]
    const query = sqltag`SELECT * FROM books WHERE id IN (${join(ids)}) OR author_id IN (${join(ids)})`

    expect(query.sql).toEqual(
      'SELECT * FROM books WHERE id IN (?,?,?) OR author_id IN (?,?,?)'
    )
    expect(query.text).toEqual(
      'SELECT * FROM books WHERE id IN ($1,$2,$3) OR author_id IN ($4,$5,$6)'
    )
    expect(query.values).toEqual([1, 2, 3, 1, 2, 3])
  })

  it('should provide "empty" helper', () => {
    const query = sqltag`SELECT * FROM books ${empty}`

    expect(query.sql).toEqual('SELECT * FROM books ')
    expect(query.text).toEqual('SELECT * FROM books ')
    expect(query.values).toEqual([])
  })

  it('should throw in constructor with no strings', () => {
    expect(() => new Sql([], [])).toThrowError('Expected at least 1 string')
  })

  it('should throw when values is less than expected', () => {
    expect(() => new Sql(['', ''], [])).toThrowError('Expected 2 strings to have 1 values')
  })
})
