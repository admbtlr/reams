import { concat } from "@tensorflow/tfjs";
import * as SQLite from "expo-sqlite";
import { Item, ItemInflated } from "store/items/types";

let db: SQLite.WebSQLDatabase

const columns = [
  'id',
  '_id',
  'content_html',
  'author',
  'date_published',
  'content_mercury',
  'decoration_failures',
  'excerpt',
  'readAt',
  'scrollRatio',
  'styles',
]

async function doTransaction(query: string, params?: any[]) {
  return new Promise(async (resolve, reject) => {
    await db.transaction(async (tx) => {
      await tx.executeSql(
        query,
        params,
        (_, { rows, rowsAffected }) => {
          resolve(rows._array)
          return rows._array
        },
        (_, error) => {
          console.log(error)
          reject(error)
          return false
        }
      )
    })
  })
}

export async function initSQLite() {
  db = SQLite.openDatabase("db.db")
  await doTransaction(`
    create table if not exists items (
      id INT,
      _id STRING PRIMARY KEY NOT NULL,
      content_html TEXT,
      author TEXT,
      date_published STRING,
      content_mercury TEXT,
      decoration_failures INT,
      excerpt TEXT,
      readAt LONG,
      scrollRatio TEXT,
      styles TEXT
    );`)
  // await initSearchTable()
  console.log('SQLite initialized, items count: ', await doTransaction('select count(*) from items;'))
}

// I keep getting Error code 11: database disk image is malformed when I try to query the fts5 table
async function initSearchTable() {
  await doTransaction(`
    create virtual table if not exists items_search using fts5(
      _id,
      content_html,
      author,
      content_mercury,
      excerpt,
      content='items'
    );`)
  await doTransaction(`
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
  await doTransaction(`
    INSERT INTO items_search SELECT 
      _id,
      content_html,
      author,
      content_mercury,
      excerpt FROM items;
  `)
}

export async function setItems(items: ItemInflated[]) {

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
    items.forEach((item) => {
      tx.executeSql(
        `insert or replace into items (
          id, _id, content_html, author, date_published, content_mercury, excerpt, scrollRatio, styles
        ) values (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [ 
          item.id || null, 
          item._id, 
          item.content_html || null, 
          item.author || null, 
          item.date_published || null, 
          item.content_mercury || null, 
          item.excerpt || null, 
          JSON.stringify(item.scrollRatio), 
          JSON.stringify(item.styles)
        ],
        (_, { rows }) => {
          resolve(rows._array)
          return rows._array
        },
        (_, error) => {
          console.log(error)
          reject(error)
          return false
        }
        )
    })
  })
})
}

export function getItems(items: Item[]): Promise<ItemInflated[]> {
  const toInflate: Item[] = JSON.parse(JSON.stringify(items))
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
    tx.executeSql(
      `select * from items where _id in (${toInflate.map((item) => `"${item._id}"`).join(",")})`,
      [],
      (_, { rows }) => {
        let inflatedItems: ItemInflated[] = []
        rows._array.forEach((flate) => {
          let item = toInflate.find((item) => item._id === flate._id) as ItemInflated
          if (item) {
            item.content_html = flate.content_html
            item.author = flate.author
            item.date_published = flate.date_published
            item.content_mercury = flate.content_mercury
            item.excerpt = flate.excerpt
            item.scrollRatio = JSON.parse(flate.scrollRatio)
            item.styles = JSON.parse(flate.styles)
            inflatedItems.push(item as ItemInflated)
          }
        })
        if (inflatedItems.length !== items.length) {
          throw new Error('Items missing from database')
        }
        resolve(inflatedItems)
        return inflatedItems
      },
      (_, error) => {
        console.log(error)
        reject(error)
        return false
      }
    )
  })
})
}

export async function inflateItem (item: Item): Promise<ItemInflated> {
  const items: ItemInflated[] = await getItems([item])
  return items[0]
}

export async function updateItems(items: Item[]) {
  for (const item of items) {
    await updateItem(item)
  }
}

export function deleteItems(items: Item[]) {
  const query = items ?
    `delete from items where _id in (${items.map(i => `"${i._id}"`).join(",")})` :
    `delete from items`
  db.transaction((tx) => {
    tx.executeSql(query)
  })
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
  return await doTransaction(query, values.concat(toUpdate._id))
}

export async function searchItems(term: string) {
  const searchTerm = `"%${term}%"`
  const query = `SELECT * FROM items WHERE content_html LIKE ${searchTerm} OR content_mercury LIKE ${searchTerm} OR excerpt LIKE ${searchTerm};`
  return doTransaction(query)
}