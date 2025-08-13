import * as SQLite from "expo-sqlite";
import { Item, ItemInflated } from "store/items/types";
import log from "../utils/log";
import { version } from "@babel/core";

let db: SQLite.SQLiteDatabase

const migrations = [
  null,
  {
    'schema': 'ALTER TABLE items ADD COLUMN coverImageUrl TEXT;',
    'data': 'UPDATE items SET coverImageUrl = $coverImageUrl WHERE _id = $_id'
  },
  {
    'schema': 'ALTER TABLE items ADD COLUMN imageDimensions TEXT;',
    'data': 'UPDATE items SET imageDimensions = $imageDimensions WHERE _id = $_id'
  },
]

const columns = [
  '_id',
  'author',
  'content_html',
  'coverImageUrl',
  'content_mercury',
  'decoration_failures',
  'excerpt',
  'faceCentreNormalised',
  'id',
  'imageDimensions',
  'readAt',
  'scrollRatio',
  'styles',
]

// async function doTransaction(query: string, params?: any[]) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       await db.transaction(async (tx) => {
//         await tx.executeSql(
//           query,
//           params,
//           (_, { rows, rowsAffected }) => {
//             resolve(rowsToArray(rows))
//             return rowsToArray(rows)
//           },
//           (_, error) => {
// console.log(error)
//             reject(error)
//             return false
//           }
//         )
//       })
//     } catch (error) {
//       log(error)
//       reject(error)
//     }
//   })
// }

export function initSQLite() {
  try {
    db = SQLite.openDatabaseSync("db.db")
    const rows = db.getAllSync('SELECT name FROM sqlite_schema WHERE type="table" AND name="items";')
    if (rows.length === 0) {
      db.runSync(`
        create table items (
          _id STRING PRIMARY KEY NOT NULL,
          author TEXT,
          content_html TEXT,
          content_mercury TEXT,
          date_published STRING,
          decoration_failures INT,
          excerpt TEXT,
          faceCentreNormalised TEXT,
          id INT,
          readAt LONG,
          scrollRatio TEXT,
          styles TEXT
        );
      `)
      initSearchTable()
    }
    doSchemaMigrations()
    console.log('SQLite initialized, items count: ', db.getFirstSync('select count(*) from items;'))
  } catch (error) {
    log('initSQLite', error)
    throw error
  }
}

function doSchemaMigrations() {
  const versionQuery: { user_version: number } | null = db.getFirstSync('PRAGMA user_version')
  const oldVersion = versionQuery?.user_version ?? 1
  let newVersion = oldVersion
  for (let i = 0; i < migrations.length; i++) {
    const migration = migrations[i]
    if (i > oldVersion && migration !== null) {
      db.runSync(migration.schema)
      newVersion = i
    }
  }
  if (newVersion !== oldVersion) {
    db.runSync(`PRAGMA user_version =  ${newVersion}`)
  }
}

// data should be { $columnName: value }[]
export function doDataMigration(index: number, data: {}[]) {
  debugger
  const query = migrations[index]?.data
  if (query) {
    let preparedStmt
    try {
      preparedStmt = db.prepareSync(query)
      for (const row of data) {
        preparedStmt.executeSync(row)
      }

    } catch (e: any) {
      console.error(e)
    } finally {
      if (preparedStmt !== undefined) preparedStmt.finalizeSync()
    }
  }
}

// I keep getting Error code 11: database disk image is malformed when I try to query the fts5 table
async function initSearchTable() {
  try {
    await db.runAsync(`
    create virtual table if not exists items_search using fts5(
      _id,
      content_html,
      author,
      content_mercury,
      excerpt,
      content='items'
    );`)
    await db.runAsync(`
      create trigger if not exists items_search_insert after insert on items begin
        insert into items_search (
          _id,
          content_html,
          author,
          content_mercury,
          excerpt
        ) values (
          new._id,
          new.content_html,
          new.author,
          new.content_mercury,
          new.excerpt
        );
      end;`)
    await db.runAsync(`
      INSERT INTO items_search SELECT
        _id,
        content_html,
        author,
        content_mercury,
        excerpt FROM items;
    `)
    // const result = await db.getAllAsync<any>('SELECT * FROM items_search WHERE items_search MATCH ?', 'software')
  } catch (e) {
    log(e)
  }
}

export async function setItems(items: ItemInflated[]) {
  // console.log('setItems')
  for (const item of items) {
    try {
      await db.runAsync(`insert or replace into items (
          id, _id, content_html, author, content_mercury, coverImageUrl, excerpt, faceCentreNormalised, imageDimensions, scrollRatio, styles
        ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          item.id || null,
          item._id,
          item.content_html || null,
          item.author || null,
          item.content_mercury || null,
          item.coverImageUrl || null,
          item.excerpt || null,
          JSON.stringify(item.faceCentreNormalised),
          JSON.stringify(item.imageDimensions),
          JSON.stringify(item.scrollRatio),
          JSON.stringify(item.styles)
        ]
      )
    } catch (e) {
      log('setItems', e)
      throw e
    }
    // console.log('setItems done')
  }
}

export async function getItems(items: Item[]): Promise<ItemInflated[]> {
  // console.log('getItems')
  const toInflate: Item[] = JSON.parse(JSON.stringify(items))
  const query = `select * from items where _id in (${toInflate.map((item) => `"${item._id}"`).join(",")})`
  let rows = await db.getAllAsync(query)
  try {
    if (rows.length !== items.length) {
      log(new Error('Items missing from database'))
      throw new Error('Items missing from database')
    }
    return inflateItems(toInflate, rows)
  } catch (e) {
    log(e)
    throw e
  }
}

export function getItemsSync(items: Item[]): ItemInflated[] {
  // console.log('getItems')
  const toInflate: Item[] = JSON.parse(JSON.stringify(items))
  const query = `select * from items where _id in (${toInflate.map((item) => `"${item._id}"`).join(",")})`
  const rows = db.getAllSync(query)
  try {
    if (rows.length !== items.length) {
      log(new Error('Items missing from database'))
      throw new Error('Items missing from database')
    }
    return inflateItems(toInflate, rows)
  } catch (e) {
    log(e)
    throw e
  }
}

function inflateItems(toInflate: Item[], rows: unknown[]): ItemInflated[] {
  let inflated: ItemInflated[] = []
  rows.forEach((flate: any) => {
    let item = toInflate.find((item) => item._id === flate._id) as ItemInflated
    if (item) {
      item.content_html = flate.content_html
      item.author = flate.author
      item.content_mercury = flate.content_mercury
      item.coverImageUrl = flate.coverImageUrl
      item.excerpt = flate.excerpt
      item.faceCentreNormalised = JSON.parse(flate.faceCentreNormalised)
      item.imageDimensions = JSON.parse(flate.imageDimensions)
      item.scrollRatio = JSON.parse(flate.scrollRatio)
      item.styles = JSON.parse(flate.styles)
    }
    inflated.push(item)
  })
  return inflated
}

export async function getItem(item: Item): Promise<ItemInflated> {
  try {
    const items: ItemInflated[] = await getItems([item])
    return items[0]
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function inflateItem(item: Item): Promise<ItemInflated> {
  try {
    const items = await getItems([item])
    return items[0]
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function updateItems(items: Item[]) {
  // console.log('updateItems')
  try {
    for (const item of items) {
      // console.log('updateItem ' + item._id)
      await updateItem(item)
      // console.log('updateItem done ' + item._id)
    }
  } catch (error) {
    console.log(error)
    throw error
  }
  // console.log('updateItems done')
}

export async function deleteItems(items: Item[]) {
  console.log('deleteItems')
  const query = items ?
    `delete from items where _id in (${items.map(i => `"${i._id}"`).join(",")})` :
    `delete from items`
  await db.runAsync(query)
  console.log('deleteItems done')
}

export async function updateItem(toUpdate: Record<string, any>) {
  const keys = Object.keys(toUpdate).filter((key) => key !== "_id").
    filter((key) => columns.indexOf(key) !== -1)
  const updateString = keys.map((key) => `${key} = ?`).join(",")
  const values = keys.map((key) => typeof toUpdate[key] === "boolean" ?
    (toUpdate[key] ?
      1 :
      0) :
    (typeof toUpdate[key] === "object" ?
      JSON.stringify(toUpdate[key]) :
      toUpdate[key])).map((value) => value === 'null' ? null : value)
  const query = `update items set ${updateString} where _id = ?`
  try {
    await db.runAsync(query, values.concat(toUpdate._id))
  } catch (error) {
    log('updateItem', error)
    throw error
  }
}

export function searchItems(term: string): ItemInflated[] {
  const searchTerm = `"%${term}%"`
  const query = `SELECT * FROM items WHERE content_html LIKE ${searchTerm} OR content_mercury LIKE ${searchTerm} OR excerpt LIKE ${searchTerm};`
  return db.getAllSync(query)
}

export function deleteAllItems() {
  const query = 'DELETE FROM items'
  return db.runSync(query)
}
