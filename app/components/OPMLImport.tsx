import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import DocumentPicker from 'react-native-document-picker'
import { parseString } from 'react-native-xml2js'
const RNFS = require('react-native-fs')
import { 
  ADD_MESSAGE, 
  REMOVE_MESSAGE, 
  SHOW_MODAL 
} from '../store/ui/types'

const xml = `
<?xml version="1.0" encoding="UTF-8"?>
<opml version="1.0">
  <head>
    <title>RSS subscriptions for ab@adam-butler.com</title>
    <dateCreated>Tue, 16 Jun 2020 08:56:52 +0000</dateCreated>
    <ownerEmail>ab@adam-butler.com</ownerEmail>
  </head>
  <body>
<outline text="Daring Fireball" title="Daring Fireball" type="rss" xmlUrl="http://daringfireball.net/index.xml" htmlUrl="https://daringfireball.net/"/>
<outline text="kottke.org" title="kottke.org" type="rss" xmlUrl="http://feeds.kottke.org/main" htmlUrl="http://kottke.org/"/>
<outline text="CSS-Tricks" title="CSS-Tricks" type="rss" xmlUrl="http://feeds.feedburner.com/CssTricks" htmlUrl="https://css-tricks.com"/>
<outline text="inessential.com" title="inessential.com" type="rss" xmlUrl="http://inessential.com/xml/rss.xml" htmlUrl="https://inessential.com/"/>
<outline text="NYRblog" title="NYRblog" type="rss" xmlUrl="http://feeds.feedburner.com/nyrblog" htmlUrl="https://www.nybooks.com/daily/"/>
<outline text="Phil Gyford (personal)" title="Phil Gyford (personal)" type="rss" xmlUrl="http://feeds.feedburner.com/PhilGyford" htmlUrl="http://www.gyford.com"/>
<outline text="xkcd.com" title="xkcd.com" type="rss" xmlUrl="https://xkcd.com/rss.xml" htmlUrl="https://xkcd.com/"/>
<outline text="The Millions" title="The Millions" type="rss" xmlUrl="http://feeds2.feedburner.com/themillionsblog/fedw" htmlUrl="https://themillions.com"/>
<outline text="The New Yorker" title="The New Yorker" type="rss" xmlUrl="http://www.newyorker.com/rss" htmlUrl="http://www.newyorker.com"/>
<outline text="Interconnected" title="Interconnected" type="rss" xmlUrl="http://interconnected.org/home/;rss2" htmlUrl="http://interconnected.org/home"/>
<outline text="MIT Technology Review" title="MIT Technology Review" type="rss" xmlUrl="https://www.technologyreview.com/stories.rss" htmlUrl="https://www.technologyreview.com"/>
<outline text="Input" title="Input" type="rss" xmlUrl="https://www.inputmag.com/rss" htmlUrl="https://www.inputmag.com"/>
<outline text="Pluralistic: Daily links from Cory Doctorow" title="Pluralistic: Daily links from Cory Doctorow" type="rss" xmlUrl="https://pluralistic.net/feed/" htmlUrl="https://pluralistic.net"/>
  </body>
</opml>
`

interface Feed {
  url:String, 
  title?:String
}

export default function OPMLImport (props: { textStyles?: {}, addFeeds: ([]) => {} }) {
  const dispatch = useDispatch()
  let feeds: Array<Feed> = []
  let res: {
    uri?: string,
    type?: string,
    name?: string,
    size?: number
  } = {}

  const openDocumentPicker = async (): Promise<void> => {
    try {
      res = await DocumentPicker.pick({})
      console.log(
        res.uri,
        res.type, // mime type
        res.name,
        res.size
      )
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
    try {
      // const filePath = __DEV__ ?
      //   `file://${RNFS.DocumentDirectoryPath}/subscriptions.xmls` :
      const filePath = res.uri
      const contents = await RNFS.readFile(filePath)
      const traverse = (o: any, feeds: Array<Feed>) => {
        let iterable = o
        if (!Array.isArray(o)) {
          iterable = Object.values(o)
        }
        iterable.forEach((leaf: any) => {
          if (leaf && leaf.xmlUrl) {
            feeds.push({
              url: leaf.xmlUrl,
              title: leaf.title
            })
          }
          if (leaf != null && typeof(leaf) === 'object') {
            traverse(leaf, feeds)
          }
        })
      }
    
      parseString(contents, (err: any, result: any) => {
        if (err) throw err
        console.log(result)
        traverse(result, feeds)
        if (feeds.length > 0) {
          dispatch({
            type: ADD_MESSAGE,
            message: 'Adding feeds'
          })
          props.addFeeds(feeds)
          dispatch({
            type: REMOVE_MESSAGE,
            messageString: 'Adding feeds'
          })
        }
      })  
    } catch (err) {
      dispatch({
        type: REMOVE_MESSAGE,
        messageString: 'Adding feeds'
      })
      dispatch({
        type: SHOW_MODAL,
        modalProps: {
          isError: true,
          modalText: [
            {
              text: 'Error Reading File',
              style: ['title']
            },
            {
              text: 'There was an error reading the OPML file. Are you sure you chose the right one?',
              style: ['text']
            }
          ],
          modalHideCancel: true,
          modalShow: true,
          modalOnOk: () => {}
        }
      })
    }
  }
  
  
  return (
    <View>
      <TouchableOpacity 
        onPress={ openDocumentPicker }
        style={{
          margin: 0,
          padding: 0
        }}
      >
        <Text style={props.textStyles}>Import an OPML file</Text>
      </TouchableOpacity>
    </View>
  )
}