import React from 'react'
import { useColor } from '../hooks/useColor'

export const withUseColorHOC = (Component: any) => {
  return (props: any) => {
    const color = useColor(props.item?.url || props.item?.feed_url);

    return <Component color={color} {...props} />
  };
};