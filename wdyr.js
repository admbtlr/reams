import React from 'react';

if (__DEV__) {
  const ReactRedux = require("react-redux/lib");
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    logOnDifferentValues: true,
  });
}
