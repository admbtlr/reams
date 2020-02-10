import React from 'react'
import Svg, {Circle, Path, Polygon, Rect} from 'react-native-svg'

export function getRizzleButtonIcon (iconName, borderColor, backgroundColor, isEnabled) {
  switch (iconName) {
    case 'toggleViewButtonsIcon':
      return <Svg
        height='40'
        width='40'
        style={{
          left: 13,
          top: 13
        }}>
        <Path
          d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'
          strokeWidth={2}
          stroke={borderColor}
          fill='none'
        />
        <Circle
          cx='12'
          cy='12'
          r='3'
          strokeWidth={2}
          stroke={borderColor}
          fill='none'
        />
      </Svg>

    case 'showShareSheetIcon':
      return <Svg
        height='32'
        width='32'
        style={{
          position: 'absolute',
          left: 14,
          top: 7
        }}>
        <Path stroke={borderColor} strokeWidth={2} fill='none' transform='translate(1, 0)' d='M5,12 C4.71689466,12 4.34958605,12 4,12 C-4.54747351e-13,12 -4.54747351e-13,12.5662107 -4.54747351e-13,16 C-4.54747351e-13,20 -4.54747351e-13,22 -4.54747351e-13,26 C-4.54747351e-13,30 -4.54747351e-13,30 4,30 C8,30 10,30 14,30 C18,30 18,30 18,26 C18,22 18,24 18,17 C18,12 17.9526288,12.0459865 14,12 C13.4028116,11.9930521 13.7719806,12 13,12'/>
        <Path stroke={borderColor} strokeWidth={2} d='M10,18.25 L10,1' strokeLinecap='round'/>
        <Path stroke={borderColor} strokeWidth={2} d='M10,1 L16,7' strokeLinecap='round'/>
        <Path stroke={borderColor} strokeWidth={2} d='M10,1 L4,7' strokeLinecap='round'/>
      </Svg>

    case 'saveButtonIconOff':
      return <Svg
        width='35px'
        height='34px'
        viewBox='0 0 37 34'
        strokeWidth='2'
        stroke={borderColor}
        fill='none'
        style={{
          left: 6,
          top: 6
        }}>
        <Path d='M19.3058823,10 L23.3013283,2.88768776 C23.5718232,2.40617867 24.1814428,2.2351178 24.6629519,2.50561262 C24.6681837,2.50855168 24.673389,2.51153779 24.6785671,2.51457056 L30.2152447,5.75736369 C30.689889,6.03535949 30.850899,6.64450404 30.5756101,7.12072339 L26.5410884,14.1' />
        <Path d='M19.3058823,26.548712 L15.2922426,33.6568385 C15.0206918,34.1377529 14.4106983,34.3074756 13.9297839,34.0359249 C13.9294556,34.0357395 13.9291274,34.035554 13.9287993,34.0353682 L8.38060649,30.8942713 C7.89999957,30.6221768 7.73096688,30.0119917 8.0030614,29.5313848 C8.00649499,29.52532 8.00999188,29.5192912 8.01355151,29.5132995 L12.2173038,22.4373696' />
        <Path d='M16.8,22.4373696 L3.8,22.4373696 C3.24771525,22.4373696 2.8,21.9896544 2.8,21.4373696 L2.8,15.1 C2.8,14.5477153 3.24771525,14.1 3.8,14.1 L11.8,14.1' />
        <Path d='M26.5066683,22.4373696 L34.8,22.4373696 C35.3522847,22.4373696 35.8,21.9896544 35.8,21.4373696 L35.8,15.1 C35.8,14.5477153 35.3522847,14.1 34.8,14.1 L21.8,14.1' />
        <Path d='M15.4670718,3.31922035 L30.365307,29.1237209 C30.7795206,29.8411598 30.5337079,30.7585454 29.8162689,31.172759 L25.1937311,33.8415825 C24.4762921,34.255796 23.5589065,34.0099833 23.144693,33.2925444 L8.24645763,7.48804388 C7.83224406,6.77060495 8.07805679,5.85321933 8.79549574,5.43900578 L13.4180337,2.77018224 C14.1354727,2.35596868 15.0528583,2.60178142 15.4670718,3.31922035 Z' />
      </Svg>

    case 'saveButtonIconOn':
      return <Svg
        width='42px'
        height='39px'
        viewBox='0 0 42 39'
        strokeWidth='1'
        stroke={backgroundColor}
        fill={borderColor}
        style={{
          left: 5,
          top: 6
        }}>
          <Path d='M16.9091367,3.78663033 L32.7855762,30.8423987 C33.2269867,31.5946265 32.9650341,32.5564964 32.2004888,32.9907953 L27.2744394,35.7890308 C26.5098941,36.2233297 25.5322738,35.9655974 25.0908634,35.2133697 L9.21442378,8.15760134 C8.77301333,7.40537359 9.0349659,6.44350367 9.79951122,6.00920478 L14.7255607,3.2109692 C15.4901061,2.7766703 16.4677264,3.03440257 16.9091367,3.78663033 Z' id='Path-Copy-2' transform='translate(21.000000, 19.500000) rotate(60.000000) translate(-21.000000, -19.500000) ' />
          <Path d='M16.9091367,3.78663033 L32.7855762,30.8423987 C33.2269867,31.5946265 32.9650341,32.5564964 32.2004888,32.9907953 L27.2744394,35.7890308 C26.5098941,36.2233297 25.5322738,35.9655974 25.0908634,35.2133697 L9.21442378,8.15760134 C8.77301333,7.40537359 9.0349659,6.44350367 9.79951122,6.00920478 L14.7255607,3.2109692 C15.4901061,2.7766703 16.4677264,3.03440257 16.9091367,3.78663033 Z' id='Path' transform='translate(21.000000, 19.500000) rotate(-60.000000) translate(-21.000000, -19.500000) ' />
          <Path d='M16.9091367,3.78663033 L32.7855762,30.8423987 C33.2269867,31.5946265 32.9650341,32.5564964 32.2004888,32.9907953 L27.2744394,35.7890308 C26.5098941,36.2233297 25.5322738,35.9655974 25.0908634,35.2133697 L9.21442378,8.15760134 C8.77301333,7.40537359 9.0349659,6.44350367 9.79951122,6.00920478 L14.7255607,3.2109692 C15.4901061,2.7766703 16.4677264,3.03440257 16.9091367,3.78663033 Z' id='Path-Copy' />
      </Svg>

    case 'launchBrowserIcon':
      return <Svg
        height='32'
        width='32'
        viewBox='0 0 24 24'
        fill='none'
        stroke={borderColor}
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
        style={{
          position: 'absolute',
          left: 8,
          top: 8
        }}>
        <Circle cx='12' cy='12' r='11' />
        <Polygon
          points='16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76'
          fill={borderColor} />
        <Circle cx='12' cy='12' r='2'
          fill={backgroundColor} />
      </Svg>

    case 'showMercuryIconOff':
      return <Svg
        style={{
          position: 'absolute',
          left: 7,
          top: 8,
          opacity: isEnabled ? 1 : 0.3
        }}
        height='34'
        width='34'>
        <Rect stroke={borderColor} strokeWidth='2' opacity='0.5' fill='none' x='16' y='4' width='14' height='24' rx='2'></Rect>
        <Path stroke={borderColor} d='M17,8 L27,8' opacity='0.5' strokeLinecap='square' />
        <Path stroke={borderColor} d='M17,12 L27,12' opacity='0.5' strokeLinecap='square' />
        <Path stroke={borderColor} d='M17,14 L27,14' opacity='0.5' strokeLinecap='square' />
        <Path stroke={borderColor} d='M17,10 L27,10' opacity='0.5' strokeLinecap='square' />
        <Path stroke={borderColor} d='M17,16 L27,16' opacity='0.5' strokeLinecap='square' />
        <Path stroke={borderColor} d='M17,18 L27,18' opacity='0.5' strokeLinecap='square' />
        <Path stroke={borderColor} d='M17,20 L27,20' opacity='0.5' strokeLinecap='square' />
        <Path stroke={borderColor} d='M17,22 L27,22' opacity='0.5' strokeLinecap='square' />
        <Path stroke={borderColor} d='M17,24 L27,24' opacity='0.5' strokeLinecap='square' />
        <Rect stroke={borderColor} strokeWidth='2' fill={backgroundColor} x='2' y='1' width='16' height='29' rx='2'></Rect>
        <Path stroke={borderColor} d='M6,9 L14,9' strokeLinecap='square' />
        <Path stroke={borderColor} d='M6,11 L14,11' strokeLinecap='square' />
      </Svg>

    case 'showMercuryIconOn':
      return <Svg
        style={{
          position: 'absolute',
          left: 12,
          top: 10,
          opacity: isEnabled ? 1 : 0.3
        }}
        height='34'
        width='34'
      >
        <Rect stroke={borderColor} strokeWidth='2' fill={backgroundColor} opacity='0.5' x='14' y='2' width='14' height='25' rx='2' />
        <Path stroke={borderColor} d='M17,19 L25,19' opacity='0.5' strokeLinecap='square' />
        <Path stroke={borderColor} d='M17,21 L25,21' opacity='0.5' strokeLinecap='square' />
        <Rect stroke={borderColor} strokeWidth='2' fill={backgroundColor} x='1' y='1' width='16' height='29' rx='2' />
        <Path stroke={borderColor} d='M4,7 L14,7' strokeLinecap='square' />
        <Path stroke={borderColor} d='M4,9 L14,9' strokeLinecap='square' />
        <Path stroke={borderColor} d='M4,11 L14,11' strokeLinecap='square' />
        <Path stroke={borderColor} d='M4,13 L14,13' strokeLinecap='square' />
        <Path stroke={borderColor} d='M4,15 L14,15' strokeLinecap='square' />
        <Path stroke={borderColor} d='M4,17 L14,17' strokeLinecap='square' />
        <Path stroke={borderColor} d='M4,19 L14,19' strokeLinecap='square' />
        <Path stroke={borderColor} d='M4,21 L14,21' strokeLinecap='square' />
        <Path stroke={borderColor} d='M4,23 L14,23' strokeLinecap='square' />
        <Path stroke={borderColor} d='M4,25 L14,25' strokeLinecap='square' />
      </Svg>
  }
}

