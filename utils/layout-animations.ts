import { LayoutAnimation } from "react-native"

export const animateNextLayout = () => {
  LayoutAnimation.configureNext({ 
    duration: 500, 
    create: { type: 'linear', property: 'opacity' }, 
    update: { type: 'spring', springDamping: 0.4 }, 
    delete: { duration: 100, type: 'linear', property: 'opacity' } 
  })
}
