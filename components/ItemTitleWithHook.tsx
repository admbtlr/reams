import React from 'react'
import { useColor } from '../hooks/useColor';
import ItemTitle from '../containers/ItemTitle';

export default function ItemTitleWithHook(Component: ) {
  return function WrappedComponent(props: any) {
    const color = useColor(props.item.feed.url || props.item.url);
    return <ItemTitle {...props} color={color} />;
  }
}

