import React from 'react'
import { useColor } from '../hooks/useColor'

export const withUseColorHOC = (Component: any) => {
  return (props: any) => {
    const color = useColor(props.item?.url || props.item?.feed_url);
    if (props.color !== undefined) {
      return <Component {...props} />  
    }
    return <Component {...props} color={color} />
  }
}