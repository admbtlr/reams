// @flow weak

import React, { PureComponent } from 'react';
import { mod } from 'react-swipeable-views-core';

export default function virtualize(MyComponent) {
  class Virtualize extends PureComponent {
    // static propTypes = {
    //   /**
    //    * @ignore
    //    */
    //   children: (props, propName) => {
    //     if (props[propName] !== undefined) {
    //       return new Error("The children property isn't supported.");
    //     }

    //     return null;
    //   },
    //   /**
    //    * @ignore
    //    */
    //   index: PropTypes.number,
    //   /**
    //    * @ignore
    //    */
    //   onChangeIndex: PropTypes.func,
    //   /**
    //    * @ignore
    //    */
    //   onTransitionEnd: PropTypes.func,
    //   /**
    //    * Number of slide to render after the visible slide.
    //    */
    //   overscanSlideAfter: PropTypes.number,
    //   /**
    //    * Number of slide to render before the visible slide.
    //    */
    //   overscanSlideBefore: PropTypes.number,
    //   /**
    //    * When set, it's adding a limit to the number of slide: [0, slideCount].
    //    */
    //   slideCount: PropTypes.number,
    //   /**
    //    * Responsible for rendering a slide given an index.
    //    * ({ index: number }): node.
    //    */
    //   slideRenderer: PropTypes.func.isRequired,
    // };

    static defaultProps = {
      overscanSlideAfter: 2,
      // Render one more slide for going backward as it's more difficult to
      // keep the window up to date.
      overscanSlideBefore: 3,
    };

    /**
     *
     *           index          indexStop
     *             |              |
     * indexStart  |       virtualIndex
     *   |         |         |    |
     * ------------|-------------------------->
     *  -2    -1   0    1    2    3    4    5
     */
    state = {};

    componentWillMount() {
      this.setState({
        index: this.props.index || 0,
      });

      this.setWindow(this.props.index || 0);
    }

    componentWillReceiveProps(nextProps) {
      const {
        index,
      } = nextProps;

      if (typeof index === 'number' && index !== this.props.index) {
        const indexDiff = index - this.props.index;
        this.setIndex(index, this.state.virtualIndex + indexDiff, indexDiff);
      }
    }

    componentWillUnmount() {
      clearInterval(this.timer);
    }

    timer = null;

    handleChangeIndex = (virtualIndex, lastVirtualIndex) => {
      const {
        slideCount,
        onChangeIndex,
      } = this.props;

      const indexDiff = virtualIndex - lastVirtualIndex;
      let index = this.state.index + indexDiff;
      // let index = this.state.index;

      if (slideCount) {
        index = mod(index, slideCount);
      }

      // Is uncontrolled
      // what does this mean?!
      if (this.props.index === undefined) {
        this.setIndex(index, virtualIndex, indexDiff);
      }

      if (onChangeIndex) {
        onChangeIndex(index, this.state.index);
      }
    };

    handleTransitionEnd = () => {
      // Delay the update of the window to fix an issue with react-motion.
      // this.timer = setTimeout(() => {
      this.setWindow();
      // }, 0);

      if (this.props.onTransitionEnd) {
        this.props.onTransitionEnd();
      }
    };

    setIndex(index, virtualIndex, indexDiff) {
      const nextState = {
        index,
        virtualIndex,
        indexStart: this.state.indexStart,
        indexStop: this.state.indexStop,
      }

      const { overscanSlideBefore, overscanSlideAfter } = this.props

      // // We are going forward, let's render one more slide ahead.
      // if (indexDiff > 0 &&
      //   (!this.props.slideCount || nextState.indexStop < this.props.slideCount - 1)) {
      //   // don't increment if we're in this situation:
      //   //
      //   // overscanSlideBefore = 2
      //   //
      //   // indexStart.   indexStop
      //   // .   |  index      |
      //   //     |    |        |
      //   // ----+----+--------+--
      //   //     0    1        3
      //   if (index - nextState.indexStart === overscanSlideBefore) {
      //     nextState.indexStart++
      //   }
      //   nextState.indexStop += 1;
      // }

      // // we're going backwards
      // if (indexDiff < 0 &&
      //   (nextState.indexStart > 0)) {
      //   nextState.indexStop -= 1;
      //   nextState.indexStart -= 1;
      // }

      // // Extend the bounds if needed.
      // if (index > nextState.indexStop) {
      //   nextState.indexStop = index;
      // }

      // const beforeAhead = nextState.indexStart - index;

      // // Extend the bounds if needed.
      // if (beforeAhead > 0) {
      //   nextState.virtualIndex += beforeAhead;
      //   nextState.indexStart -= beforeAhead;
      // }

      nextState.indexStart = index - overscanSlideBefore < 0
        ? 0
        : index - overscanSlideBefore

      nextState.indexStop = index + overscanSlideBefore > this.props.slideCount - 1
        ? this.props.slideCount - 1
        : index + overscanSlideBefore

      nextState.virtualIndex = index - nextState.indexStart

      this.setState(nextState);
    }

    setWindow(index = this.state.index) {
      const {
        slideCount,
      } = this.props;

      let beforeAhead = this.props.overscanSlideBefore;
      let afterAhead = this.props.overscanSlideAfter;

      if (slideCount) {
        if (beforeAhead > index) {
          beforeAhead = index;
        }

        if (afterAhead + index > slideCount - 1) {
          afterAhead = slideCount - index - 1;
        }
      }

      this.setState({
        virtualIndex: beforeAhead,
        indexStart: index - beforeAhead,
        indexStop: index + afterAhead,
      });
    }

    render() {
      // console.log('RENDER')
      // console.log(this.state)
      const {
        children, // eslint-disable-line no-unused-vars
        index: indexProp, // eslint-disable-line no-unused-vars
        onChangeIndex, // eslint-disable-line no-unused-vars
        onTransitionEnd, // eslint-disable-line no-unused-vars
        overscanSlideAfter, // eslint-disable-line no-unused-vars
        overscanSlideBefore, // eslint-disable-line no-unused-vars
        slideCount, // eslint-disable-line no-unused-vars
        slideRenderer,
        ...other
      } = this.props;

      const {
        virtualIndex,
        indexStart,
        indexStop,
      } = this.state;

      const slides = [];

      for (let slideIndex = indexStart; slideIndex <= indexStop; slideIndex += 1) {
        slides.push(slideRenderer({
          index: slideIndex,
          key: slideIndex,
        }));
      }

      return (
        <MyComponent
          index={virtualIndex}
          onChangeIndex={this.handleChangeIndex}
          onTransitionEnd={this.handleTransitionEnd}
          {...other}
        >
          {slides}
        </MyComponent>
      );
    }
  }

  return Virtualize;
}
