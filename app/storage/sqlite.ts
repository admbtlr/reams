import { concat } from "@tensorflow/tfjs";
import * as SQLite from "expo-sqlite";
import { Item } from "store/items/types";

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
  'showMercuryContent',
  'hasShownMercury',
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
      id INT NOT NULL,
      _id STRING PRIMARY KEY NOT NULL,
      content_html TEXT,
      author TEXT,
      date_published STRING,
      content_mercury TEXT,
      decoration_failures INT,
      excerpt TEXT,
      readAt LONG,
      showMercuryContent BOOLEAN CHECK (showMercuryContent IN (0,1)),
      hasShownMercury BOOLEAN,
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

export async function setItems(items: Item[]) {

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
    items.forEach((item) => {
      tx.executeSql(
        `insert or replace into items (
          id, _id, content_html, author, date_published, content_mercury, excerpt, showMercuryContent, hasShownMercury, scrollRatio, styles
        ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [ 
          item.id, 
          item._id, 
          item.content_html || null, 
          item.author || null, 
          item.date_published || null, 
          item.content_mercury || null, 
          item.excerpt || null, 
          item.showMercuryContent ? 1 : 0, 
          item.hasShownMercury ? 1 : 0, 
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

export function getItems(toInflate: Item[]) {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
    tx.executeSql(
      `select * from items where _id in (${toInflate.map((item) => `"${item._id}"`).join(",")})`,
      [],
      (_, { rows }) => {
        let items: Item[] = []
        rows._array.forEach((flate) => {
          let item = toInflate.find((item) => item._id === flate._id)
          if (item) {
            item.content_html = flate.content_html
            item.author = flate.author
            item.date_published = flate.date_published
            item.content_mercury = flate.content_mercury
            item.excerpt = flate.excerpt
            item.showMercuryContent = flate.showMercuryContent
            item.hasShownMercury = flate.hasShownMercury
            item.scrollRatio = JSON.parse(flate.scrollRatio)
            item.styles = JSON.parse(flate.styles)
            items.push(item)
          }
        })
        resolve(items)
        return items
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
  return doTransaction(query, values.concat(toUpdate._id))
}

export async function searchItems(term: string) {
  const searchTerm = `%${term}%`
  const query = `SELECT * FROM items WHERE content_html LIKE ${searchTerm} OR content_mercury LIKE ${searchTerm} OR excerpt LIKE ${searchTerm};`
  return doTransaction(query)
}