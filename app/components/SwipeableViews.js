// @flow weak

import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import {
  Animated,
  Dimensions,
  InteractionManager,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import { constant, checkIndexBounds, getDisplaySameSlide } from 'react-swipeable-views-core';

// import {panHandler, onPanStart, onPanEnd} from '../utils/animationHandlers'

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  slide: {
    flex: 1,
  },
});

// I couldn't find a public API to get this value.
function getAnimatedValue(animated) {
  return animated._value; // eslint-disable-line no-underscore-dangle
}

class SwipeableViews extends Component {
  // static propTypes = {
  //   /**
  //    * If `true`, the height of the container will be animated to match the current slide height.
  //    * Animating another style property has a negative impact regarding performance.
  //    */
  //   animateHeight: PropTypes.bool,
  //   /**
  //    * If `false`, changes to the index prop will not cause an animated transition.
  //    */
  //   animateTransitions: PropTypes.bool,
  //   /**
  //    * The axis on which the slides will slide.
  //    */
  //   axis: PropTypes.oneOf(['x', 'x-reverse', 'y', 'y-reverse']),
  //   /**
  //    * Use this property to provide your slides.
  //    */
  //   // children: PropTypes.array.isRequired,
  //   /**
  //    * This is the inlined style that will be applied
  //    * to each slide container.
  //    */
  //   containerStyle: Animated.View.propTypes.style,
  //   /**
  //    * If `true`, it will disable touch events.
  //    * This is useful when you want to prohibit the user from changing slides.
  //    */
  //   disabled: PropTypes.bool,
  //   /**
  //    * Configure hysteresis between slides. This value determines how far
  //    * should user swipe to switch slide.
  //    */
  //   hysteresis: PropTypes.number,
  //   /**
  //    * This is the index of the slide to show.
  //    * This is useful when you want to change the default slide shown.
  //    * Or when you have tabs linked to each slide.
  //    */
  //   index: PropTypes.number,
  //   *
  //    * This is callback prop. It's call by the
  //    * component when the shown slide change after a swipe made by the user.
  //    * This is useful when you have tabs linked to each slide.
  //    *
  //    * @param {integer} index This is the current index of the slide.
  //    * @param {integer} fromIndex This is the oldest index of the slide.

  //   onChangeIndex: PropTypes.func,
  //   /**
  //    * This is callback prop. It's called by the
  //    * component when the slide switching.
  //    * This is useful when you want to implement something corresponding to the current slide position.
  //    *
  //    * @param {integer} index This is the current index of the slide.
  //    * @param {string} type Can be either `move` or `end`.
  //    */
  //   onSwitching: PropTypes.func,
  //   /**
  //    * @ignore
  //    */
  //   onTouchEnd: PropTypes.func,
  //   /**
  //    * @ignore
  //    */
  //   onTouchStart: PropTypes.func,
  //   /**
  //    * The callback that fires when the animation comes to a rest.
  //    * This is useful to defer CPU intensive task.
  //    */
  //   onTransitionEnd: PropTypes.func,
  //   /**
  //    * If `true`, it will add bounds effect on the edges.
  //    */
  //   resistance: PropTypes.bool,
  //   /**
  //    * This is the inlined style that will be applied
  //    * on the slide component.
  //    */
  //   slideStyle: View.propTypes.style,
  //   /**
  //    * This is the config given to Animated for the spring.
  //    * This is useful to change the dynamic of the transition.
  //    */
  //   springConfig: PropTypes.shape({
  //     tension: PropTypes.number,
  //     friction: PropTypes.number,
  //   }),
  //   /**
  //    * This is the inlined style that will be applied
  //    * on the root component.
  //    */
  //   style: View.propTypes.style,
  //   /**
  //    * This is the threshold used for detecting a quick swipe.
  //    * If the computed speed is above this value, the index change.
  //    */
  //   threshold: PropTypes.number,
  //   /**
  //    * Number of slides to render before and after current
  //    */
  //   virtualBuffer: PropTypes.number
  // };

  static defaultProps = {
    animateTransitions: true,
    disabled: false,
    hysteresis: 0.6,
    index: 0,
    resistance: false,
    springConfig: {
      tension: 300,
      friction: 30,
    },
    threshold: 5,
    virtualBuffer: 1
  };

  state = {
    interactionsComplete: false
  };

  // calculateIndexVirtual (index, virtualBuffer) {
  //   let indexVirtual = props.virtualBuffer
  //   if (props.index < props.virtualBuffer) {
  //     indexVirtual = props.index
  //   }
  //   return indexVirtual
  // }

  calculateStateBasedOnIndex (index = this.props.index) {
    const indexVirtual = this.calculateIndexVirtual(index)
    let indexVirtualAnimated = this.state.indexVirtual

    // this happens when we swtich between the first 3 items
    // when the indexVirtual will be less than its standard value, which is
    // this.props.virtualBuffer, i.e. 2 by default
    // if the indexActual is < 2, indexVirtual should equal indexActual
    if (indexVirtualAnimated === undefined || getAnimatedValue(indexVirtualAnimated) !== indexVirtual) {
      indexVirtualAnimated = new Animated.Value(indexVirtual, {
        useNativeDriver: true
      })
    }

    return {
      indexActual: index, // based on the total set of slides
      indexVirtualLast: indexVirtual,
      indexVirtual: indexVirtualAnimated, // based on virtualised set
      panValue: Animated.modulo(indexVirtualAnimated, 1), // -1 < 0 < 1
      viewLength: Dimensions.get('window').width,
      interactionsComplete: false
    }
  }

  componentWillMount() {
    // if (process.env.NODE_ENV !== 'production') {
    //   checkIndexBounds(this.props);
    // }
    this.setState(this.calculateStateBasedOnIndex())

    this.panResponder = PanResponder.create({
      // Claim responder if it's a horizontal pan
      onMoveShouldSetPanResponder: (event, gestureState) => {
        const dx = Math.abs(gestureState.dx);
        const dy = Math.abs(gestureState.dy);

        return dx > dy && dx > constant.UNCERTAINTY_THRESHOLD;
      },
      onPanResponderRelease: this.handleTouchEnd.bind(this),
      onPanResponderTerminate: this.handleTouchEnd.bind(this),
      onPanResponderMove: this.handleTouchMove.bind(this),
      onPanResponderGrant: this.handleTouchStart.bind(this),
    });
  }

  componentDidMount () {
    // panHandler(this.state.panValue)
  }

  componentWillReceiveProps(nextProps) {
    const {
      index,
      animateTransitions,
      virtualBuffer
    } = nextProps;

    console.log('SwipeableViews received props!')

    if (typeof index === 'number' &&
      (!this.state.indexActual ||
      index !== this.state.indexActual)) {
      // seems weird to call setState here, but apparently it's kosher
      this.setState(this.calculateStateBasedOnIndex(nextProps.index))
    }
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    console.log('Should swipeable views update?')
    return true
  }

  calculateIndexVirtual = (index) => {
    const {virtualBuffer} = this.props
    return index < virtualBuffer ?
      index :
      virtualBuffer
  }

  calculateIndexActual = () => {
    const {indexVirtual, indexVirtualLast} = this.state
    const delta = getAnimatedValue(indexVirtual) - indexVirtualLast
    return this.state.indexActual + delta
  }

  // setWindow = () => {
  //   // now we can change indexActual based on indexPrevious and indexVirtualLast
  //   // and reset indexVirtual based on the value of virtualBuffer
  //   const indexActual = this.calculateIndexActual()
  //   const newIndexVirtual = this.calculateIndexVirtual(indexActual)
  //   this.state.indexVirtual.setValue(newIndexVirtual)
  //   this.setState({
  //     ...this.state,
  //     indexActual,
  //     indexVirtualLast: newIndexVirtual
  //   })
  // }

  // copied from react-swipeable-views-utils
  // and adapted to replace `children` with `slideCount`
  computeIndex = (params) => {
    const { slideCount, startIndex, startX, pageX, viewLength, resistance } = params;

    const indexMax = slideCount - 1;
    let index = startIndex + (startX - pageX) / viewLength;
    let newStartX;

    if (!resistance) {
      // Reset the starting point
      if (index < 0) {
        index = 0;
        newStartX = (index - startIndex) * viewLength + pageX;
      } else if (index > indexMax) {
        index = indexMax;
        newStartX = (index - startIndex) * viewLength + pageX;
      }
    } else if (index < 0) {
      index = Math.exp(index * constant.RESISTANCE_COEF) - 1;
    } else if (index > indexMax) {
      index = indexMax + 1 - Math.exp((indexMax - index) * constant.RESISTANCE_COEF);
    }

    return {
      index,
      startX: newStartX,
    };
  }

  panResponder = undefined;
  startX = 0;
  startIndex = 0;

  handleTouchStart = (event, gestureState) => {
    this.interactionHandle = InteractionManager.createInteractionHandle()
    if (this.props.onTouchStart) {
      this.props.onTouchStart(event, gestureState);
    }
    // onPanStart(event)

    this.startX = gestureState.x0;
    this.startIndex = getAnimatedValue(this.state.indexVirtual);
  };

  handleTouchMove = (event, gestureState) => {
    const {
      onSwitching,
      resistance,
    } = this.props;

    const {
      index,
      startX,
    } = this.computeIndex({
      slideCount: this.props.slideCount,
      resistance,
      pageX: gestureState.moveX,
      startIndex: this.startIndex,
      startX: this.startX,
      viewLength: this.state.viewLength,
    });

    if (startX) {
      this.startX = startX;
    }

    this.state.indexVirtual.setValue(index);

    if (onSwitching) {
      onSwitching(index, 'move');
    }
  };

  handleTouchEnd = (event, gestureState) => {
    if (this.props.onTouchEnd) {
      this.props.onTouchEnd(event, gestureState);
    }

    const {
      vx,
      moveX,
    } = gestureState;

    const indexVirtualLast = this.state.indexVirtualLast;
    const indexVirtual = indexVirtualLast + ((this.startX - moveX) / this.state.viewLength);
    let delta = indexVirtualLast - indexVirtual;

    let indexVirtualNew;

    // Quick movement
    if (Math.abs(vx) * 10 > this.props.threshold) {
      if (vx > 0) {
        indexVirtualNew = Math.floor(indexVirtual);
      } else {
        indexVirtualNew = Math.ceil(indexVirtual);
      }
    } else if (Math.abs(delta) > this.props.hysteresis) {
      // Some hysteresis with indexVirtualLast.
      indexVirtualNew = delta > 0 ? Math.floor(indexVirtual) : Math.ceil(indexVirtual);
    } else {
      indexVirtualNew = indexVirtualLast;
    }

    const indexMax = this.props.virtualBuffer * 2 + 1;

    if (indexVirtualNew < 0) {
      indexVirtualNew = 0;
    } else if (indexVirtualNew > indexMax) {
      indexVirtualNew = indexMax;
    }

    // this.setState({
    //   ...this.state,
    //   indexVirtualLast: indexVirtualNew
    // })
    this.animateIndexVirtual(indexVirtualNew);

  };

  animateIndexVirtual (indexVirtualNew) {
    // Avoid starting an animation when we are already on the right value.
    if (getAnimatedValue(this.state.indexVirtual) !== indexVirtualNew) {
      Animated.spring(this.state.indexVirtual, {
        toValue: indexVirtualNew,
        ...this.props.springConfig,
      }).start(this.handleAnimationFinished.bind(this, {
        finished: true,
        indexVirtualNew
      }));
    } else {
      this.handleAnimationFinished({
        indexVirtualNew
      });
    }
  }

  handleAnimationFinished = (params) => {
    // The animation can be aborted.
    // We only want to call onTransitionEnd when the animation is finished.
    if (params.finished) {
      const indexVirtualNew = params.indexVirtualNew
      // const indexVirtualOld = getAnimatedValue(this.state.indexVirtual)
      const delta = indexVirtualNew - this.state.indexVirtualLast

      const indexActualNew = this.state.indexActual + delta

      const indexActualOld = this.state.indexActual
      const state = this.calculateStateBasedOnIndex(indexActualNew)
      indexVirtualNew = this.calculateIndexVirtual(indexActualNew)
      this.state.indexVirtual.setValue(indexVirtualNew)
      if (indexActualOld !== indexActualNew) {
        if (this.props.onChangeIndex) {
          this.props.onChangeIndex(indexActualNew, indexActualOld);
        }
        this.setState({
          ...state,
          indexActual: indexActualNew,
          indexVirtualLast: indexVirtualNew
        })
      }
      this.props.onTransitionEnd && this.props.onTransitionEnd()

      if (this.interactionHandle) {
        InteractionManager.clearInteractionHandle(this.interactionHandle)
        this.interactionHandle = null
      }
      // if (this.props.onSwitching) {
      //   this.props.onSwitching(indexActualNew, 'end');
      // }
    }
    // onPanEnd({type: 'end'})
  };

  // setStateAfterInteractions = (state) => {
  //   this.interactionHandle = InteractionManager.runAfterInteractions(() => {
  //     this.setState({
  //       ...state,
  //       interactionsComplete: true
  //     })
  //     this.interactionHandle = null
  //   })
  //   // this.setState({
  //   //   ...state,
  //   //   interactionsComplete: false
  //   // })
  // }

  handleLayout = (event) => {
    const { width } = event.nativeEvent.layout;

    if (width) {
      this.setState({
        viewLength: width,
      });
    }
  };

  render() {
    const {
      slideCount,
      style,
      slideStyle,
      slideRenderer,
      containerStyle,
      disabled,
      hysteresis, // eslint-disable-line no-unused-vars
      index, // eslint-disable-line no-unused-vars
      onTransitionEnd, // eslint-disable-line no-unused-vars
      virtualBuffer, // eslint-disable-line no-unused-vars
      ...other
    } = this.props;

    const {
      indexVirtual,
      indexActual,
      viewLength,
    } = this.state;

    const slideStyleObj = [styles.slide, slideStyle]
    let indexStart = indexActual - virtualBuffer
    indexStart = indexStart < 0 ? 0 : indexStart
    let indexEnd = indexActual + virtualBuffer
    indexEnd = indexEnd > slideCount - 1 ? slideCount - 1 : indexEnd

    console.log('SwipeableViews rendering!')

    this.children = []

    for (let slideIndex = indexStart; slideIndex <= indexEnd; slideIndex += 1) {
      this.children.push(slideRenderer({
        index: slideIndex,
        key: slideIndex
      }));
    }

    const sceneContainerStyle = [
      styles.container,
      {
        width: viewLength * (indexEnd - indexStart + 1),
        transform: [
          {
            translateX: indexVirtual.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -viewLength],
            }),
            // translateX: indexVirtual * -viewLength
          },
        ],
      },
      containerStyle,
    ];

    const panHandlers = disabled ? {} : this.panResponder.panHandlers;

    return (
      <View style={[styles.root, style]} onLayout={this.handleLayout} {...other}>
        <Animated.View {...panHandlers} style={sceneContainerStyle}>
          {this.children}
        </Animated.View>
      </View>
    );
  }
}

export default SwipeableViews;
