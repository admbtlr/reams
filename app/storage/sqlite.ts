import * as SQLite from "expo-sqlite";
import { Item } from "store/items/types";

let db: SQLite.WebSQLDatabase

async function doTransaction(query: string, params?: any[]) {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        query,
        params,
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
}

export async function initSQLite() {
  db = SQLite.openDatabase("db.db")
  await doTransaction(`
  create table if not exists items (
    id INT PRIMARY KEY NOT NULL,
    _id STRING NOT NULL,
    content_html TEXT,
    author TEXT,
    date_published STRING,
    content_mercury TEXT,
    excerpt TEXT,
    showMercuryContent BOOLEAN CHECK (showMercuryContent IN (0,1)),
    hasShownMercury BOOLEAN,
    scrollRatio TEXT,
    styles TEXT
  );`)
  console.log('SQLite initialized, items count: ', await doTransaction('select count(*) from items;'))
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
      `select * from items where id in (${toInflate.map((item) => item.id).join(",")})`,
      [],
      (_, { rows }) => {
        let items: Item[] = []
        rows._array.forEach((flate) => {
          let item = toInflate.find((item) => item.id === flate.id)
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

export function updateItems(toUpdate: Item[]) {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
    toUpdate.forEach((item) => {
      tx.executeSql(
        `update items set 
          content_html = ?,
          author = ?,
          date_published = ?,
          content_mercury = ?,
          excerpt = ?,
          showMercuryContent = ?,
          hasShownMercury = ?,
          scrollRatio = ?,
          styles = ?
        where id = ?`,
        [
          item.content_html || null, 
          item.author || null, 
          item.date_published || null, 
          item.content_mercury || null, 
          item.excerpt || null, 
          item.showMercuryContent ? 1 : 0, 
          item.hasShownMercury ? 1 : 0, 
          JSON.stringify(item.scrollRatio), 
          JSON.stringify(item.styles),
          item.id
        ]
      )
    })
  }),
  (_: any) => {
    resolve(true)
    return true
  },
  (_: any, error: string) => {
    console.log(error)
    reject(error)
    return false
  }
})
}

export function deleteItems(ids: number[]) {
  db.transaction((tx) => {
    tx.executeSql(
      `delete from items where id in (${ids.join(",")})`
    )
  })
}

export function updateItem(toUpdate: Item) {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
    tx.executeSql(
      `update items set 
        content_html = ?,
        author = ?,
        date_published = ?,
        content_mercury = ?,
        excerpt = ?,
        showMercuryContent = ?,
        hasShownMercury = ?,
        scrollRatio = ?,
        styles = ?
      where id = ?`,
      [
        toUpdate.content_html || null, 
        toUpdate.author || null, 
        toUpdate.date_published || null, 
        toUpdate.content_mercury || null, 
        toUpdate.excerpt || null, 
        toUpdate.showMercuryContent ? 1 : 0, 
        toUpdate.hasShownMercury ? 1 : 0, 
        JSON.stringify(toUpdate.scrollRatio), 
        JSON.stringify(toUpdate.styles),
        toUpdate.id
      ]
    )
  }),
  (_: any) => {
    resolve(true)
    return true
  },
  (_: any, error: string) => {
    console.log(error)
    return false
  }
})
}
