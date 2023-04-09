import React from 'react'
import Svg, {Circle, G, Path, Polygon, Rect, Line} from 'react-native-svg'
import { fontSizeMultiplier } from '../utils'

export function getRizzleButtonIcon (iconName, borderColor, backgroundColor, isEnabled, applyFontScaling = true) {
  const fontScale = (size) => applyFontScaling ?
    fontSizeMultiplier() * size :
    size

  switch (iconName) {
    case 'toggleViewButtonsIcon':
      return <Svg
        height={ fontScale(40) }
        width={ fontScale(40) }
        style={{
          left: fontScale(13),
          top: fontScale(13)
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
        height={ fontScale(32) }
        width={ fontScale(32) }
        style={{
          position: 'absolute',
          left: fontScale(14),
          top: fontScale(7)
        }}>
        <Path stroke={borderColor} strokeWidth={2} fill='none' transform='translate(1, 0)' d='M5,12 C4.71689466,12 4.34958605,12 4,12 C-4.54747351e-13,12 -4.54747351e-13,12.5662107 -4.54747351e-13,16 C-4.54747351e-13,20 -4.54747351e-13,22 -4.54747351e-13,26 C-4.54747351e-13,30 -4.54747351e-13,30 4,30 C8,30 10,30 14,30 C18,30 18,30 18,26 C18,22 18,24 18,17 C18,12 17.9526288,12.0459865 14,12 C13.4028116,11.9930521 13.7719806,12 13,12'/>
        <Path stroke={borderColor} strokeWidth={2} d='M10,18.25 L10,1' strokeLinecap='round'/>
        <Path stroke={borderColor} strokeWidth={2} d='M10,1 L16,7' strokeLinecap='round'/>
        <Path stroke={borderColor} strokeWidth={2} d='M10,1 L4,7' strokeLinecap='round'/>
      </Svg>

    case 'saveButtonIconOff':
      return <Svg 
        width={ fontScale(28) }
        height={ fontScale(28) }
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          left: fontScale(10),
          top: fontScale(9)
        }}
        fill="none"
        stroke={borderColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <Path d="M 18 23 l -6 -5 l -6 5 V 5 a 2 2 0 0 1 2 -2 h 8 a 2 2 0 0 1 2 2 z" />
        <Path strokeWidth='1' style={{ opacity: 0.6 }} d='M 10 10 H 14 M 10 12 H 14 M 10 14 H 14' />
      </Svg>
    // return <Svg
      //   width={ fontScale(35) }
      //   height={ fontScale(35) }
      //   viewBox='0 0 37 34'
      //   strokeWidth='2'
      //   stroke={borderColor}
      //   fill='none'
      //   style={{
      //     left: fontScale(6),
      //     top: fontScale(6)
      //   }}>
      //   <Path d='M19.3058823,10 L23.3013283,2.88768776 C23.5718232,2.40617867 24.1814428,2.2351178 24.6629519,2.50561262 C24.6681837,2.50855168 24.673389,2.51153779 24.6785671,2.51457056 L30.2152447,5.75736369 C30.689889,6.03535949 30.850899,6.64450404 30.5756101,7.12072339 L26.5410884,14.1' />
      //   <Path d='M19.3058823,26.548712 L15.2922426,33.6568385 C15.0206918,34.1377529 14.4106983,34.3074756 13.9297839,34.0359249 C13.9294556,34.0357395 13.9291274,34.035554 13.9287993,34.0353682 L8.38060649,30.8942713 C7.89999957,30.6221768 7.73096688,30.0119917 8.0030614,29.5313848 C8.00649499,29.52532 8.00999188,29.5192912 8.01355151,29.5132995 L12.2173038,22.4373696' />
      //   <Path d='M16.8,22.4373696 L3.8,22.4373696 C3.24771525,22.4373696 2.8,21.9896544 2.8,21.4373696 L2.8,15.1 C2.8,14.5477153 3.24771525,14.1 3.8,14.1 L11.8,14.1' />
      //   <Path d='M26.5066683,22.4373696 L34.8,22.4373696 C35.3522847,22.4373696 35.8,21.9896544 35.8,21.4373696 L35.8,15.1 C35.8,14.5477153 35.3522847,14.1 34.8,14.1 L21.8,14.1' />
      //   <Path d='M15.4670718,3.31922035 L30.365307,29.1237209 C30.7795206,29.8411598 30.5337079,30.7585454 29.8162689,31.172759 L25.1937311,33.8415825 C24.4762921,34.255796 23.5589065,34.0099833 23.144693,33.2925444 L8.24645763,7.48804388 C7.83224406,6.77060495 8.07805679,5.85321933 8.79549574,5.43900578 L13.4180337,2.77018224 C14.1354727,2.35596868 15.0528583,2.60178142 15.4670718,3.31922035 Z' />
      // </Svg>

    case 'saveButtonIconOn':
      return <Svg 
        width={ fontScale(28) }
        height={ fontScale(28) }
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          left: fontScale(12),
          top: fontScale(10)
        }}
        fill={borderColor}
        stroke={borderColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <Path d="M 18 21 A 2 2 0 0 1 16 23 h -8 A 2 2 0 0 1 6 21 V 3 l 6 4 L 18 3 z" />
        <Path strokeWidth='1' stroke={backgroundColor} style={{ opacity: 0.6 }} d='M 10 12 H 14 M 10 14 H 14 M 10 16 H 14' />
      </Svg>
    // return <Svg
      //   width={ fontScale(42) }
      //   height={ fontScale(39) }
      //   viewBox='0 0 42 39'
      //   strokeWidth='1'
      //   stroke={backgroundColor}
      //   fill={borderColor}
      //   style={{
      //     left: fontScale(5),
      //     top: fontScale(6)
      //   }}>
      //     <Path d='M16.9091367,3.78663033 L32.7855762,30.8423987 C33.2269867,31.5946265 32.9650341,32.5564964 32.2004888,32.9907953 L27.2744394,35.7890308 C26.5098941,36.2233297 25.5322738,35.9655974 25.0908634,35.2133697 L9.21442378,8.15760134 C8.77301333,7.40537359 9.0349659,6.44350367 9.79951122,6.00920478 L14.7255607,3.2109692 C15.4901061,2.7766703 16.4677264,3.03440257 16.9091367,3.78663033 Z' id='Path-Copy-2' transform='translate(21.000000, 19.500000) rotate(60.000000) translate(-21.000000, -19.500000) ' />
      //     <Path d='M16.9091367,3.78663033 L32.7855762,30.8423987 C33.2269867,31.5946265 32.9650341,32.5564964 32.2004888,32.9907953 L27.2744394,35.7890308 C26.5098941,36.2233297 25.5322738,35.9655974 25.0908634,35.2133697 L9.21442378,8.15760134 C8.77301333,7.40537359 9.0349659,6.44350367 9.79951122,6.00920478 L14.7255607,3.2109692 C15.4901061,2.7766703 16.4677264,3.03440257 16.9091367,3.78663033 Z' id='Path' transform='translate(21.000000, 19.500000) rotate(-60.000000) translate(-21.000000, -19.500000) ' />
      //     <Path d='M16.9091367,3.78663033 L32.7855762,30.8423987 C33.2269867,31.5946265 32.9650341,32.5564964 32.2004888,32.9907953 L27.2744394,35.7890308 C26.5098941,36.2233297 25.5322738,35.9655974 25.0908634,35.2133697 L9.21442378,8.15760134 C8.77301333,7.40537359 9.0349659,6.44350367 9.79951122,6.00920478 L14.7255607,3.2109692 C15.4901061,2.7766703 16.4677264,3.03440257 16.9091367,3.78663033 Z' id='Path-Copy' />
      // </Svg>

    case 'launchBrowserIcon':
      return <Svg
        height={ fontScale(32) }
        width={ fontScale(32) }
        viewBox='0 0 24 24'
        fill='none'
        stroke={borderColor}
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
        style={{
          position: 'absolute',
          left: fontScale(8),
          top: fontScale(8)
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
          left: fontScale(9),
          top: fontScale(9),
          opacity: isEnabled ? 1 : 0.3
        }}
        height={ fontScale(34) }
        width={ fontScale(34) }
        viewBox='0 0 34 34'>
        
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
          left: fontScale(12),
          top: fontScale(10),
          opacity: isEnabled ? 1 : 0.3
        }}
        height={ fontScale(34) }
        width={ fontScale(34) }
        viewBox='0 0 34 34'
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

    case 'account':
      return <Svg
        width='28'
        height='28'
        viewBox='0 0 24 24'
        fill='none'
        stroke={borderColor}
        strokeWidth='3'
        strokeLinecap='round'
        strokeLinejoin='round'>        
        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <Circle cx="12" cy="7" r="4" />
      </Svg>

    case 'feedbin':
      return <Svg
        height={ 26 *  fontSizeMultiplier()}
        width={ 26 *  fontSizeMultiplier()}
        viewBox='0 0 120 120'
        style={{
          top: 0
        }}
      >
        <Path fill={backgroundColor} d='M116.4,87.2c-22.5-0.1-96.9-0.1-112.4,0c-4.9,0-4.8-22.5,0-23.3c15.6-2.5,60.3,0,60.3,0s16.1,16.3,20.8,16.3 c4.8,0,16.1-16.3,16.1-16.3s12.8-2.3,15.2,0C120.3,67.9,121.2,87.3,116.4,87.2z'/>
        <Path fill={backgroundColor} d='M110.9,108.8L110.9,108.8c-19.1,2.5-83.6,1.9-103,0c-4.3-0.4-1.5-13.6-1.5-13.6h108.1 C114.4,95.2,116.3,108.1,110.9,108.8z'/>
        <Path fill={backgroundColor} d='M58.1,9.9C30.6,6.2,7.9,29.1,7.9,51.3l102.6,1C110.6,30.2,85.4,13.6,58.1,9.9z'/>
      </Svg>

    case 'feedly':
      return <Svg 
        width={fontScale(28)} 
        height={fontScale(28)} 
        viewBox='0 0 28 28'
      >
        <Path fill={backgroundColor} d='M16.0336326,3.33375996 C14.9218819,2.22208001 13.102885,2.22208001 11.9910636,3.33375996 L1.83375996,13.4912051 C0.722080014,14.6029557 0.722080014,16.4220233 1.83375996,17.5339154 L9.08174345,24.7818989 C9.58645464,25.2216207 10.246108,25.4880845 10.9680635,25.4880845 L17.0569863,25.4880845 C17.8504372,25.4880845 18.5687154,25.166461 19.0885602,24.6467577 L26.19624,17.5388656 C27.30792,16.4271857 27.30792,14.6080474 26.19624,13.4964382 L16.0336326,3.33375996 L16.0336326,3.33375996 Z M15.7506917,21.8854494 L14.7364605,22.8994683 C14.6624899,22.9737218 14.5600202,23.0196175 14.4468721,23.0196175 L13.578107,23.0196175 C13.47493,23.0196175 13.3810879,22.9815007 13.3088145,22.9187742 L12.2749946,21.8846714 C12.116163,21.7261934 12.116163,21.4665186 12.2749946,21.3080406 L13.7239973,19.8587549 C13.8826875,19.7003476 14.1423623,19.7003476 14.3006282,19.8587549 L15.7506917,21.308677 C15.9093818,21.4672964 15.9093818,21.7268299 15.7506917,21.8854494 L15.7506917,21.8854494 Z M15.7506917,15.8061442 L11.6967372,19.8598865 C11.6227666,19.9341399 11.5201554,19.9798235 11.4070073,19.9799649 L10.5382422,19.9799649 C10.4354896,19.9799649 10.3413645,19.9418482 10.2693741,19.879051 L9.23505911,18.8451603 C9.07658108,18.6863995 9.07658108,18.4268661 9.23505911,18.2683172 L13.7239973,13.7795205 C13.8826875,13.6207596 14.1423623,13.6207596 14.3009818,13.7795205 L15.7506917,15.2294425 C15.9093818,15.388062 15.9093818,15.6475954 15.7506917,15.8061442 L15.7506917,15.8061442 Z M15.7506917,9.72641465 L8.65687239,16.8198803 C8.58290184,16.8941337 8.48036139,16.9399587 8.36728402,16.9399587 L7.49851887,16.9399587 C7.39555411,16.9399587 7.30142905,16.9020541 7.22965073,16.8392569 L6.1953358,15.8051541 C6.03671632,15.6467468 6.03671632,15.3870012 6.1953358,15.2284525 L13.7239973,7.69986172 C13.8826875,7.54124225 14.1421502,7.54124225 14.3006282,7.69986172 L15.7506917,9.14978371 C15.9093818,9.30840318 15.9093818,9.56779517 15.7506917,9.72641465 L15.7506917,9.72641465 Z' />
      </Svg>

    case 'rizzle':
      return <Svg
        width={fontScale(28)}
        height={fontScale(28)}
        viewBox='0 0 37 36'
        strokeWidth='2'
        stroke={backgroundColor}
        fill='none'
        >
        <Path transform='translate(-1, 0)' d='M19.3058823,10 L23.3013283,2.88768776 C23.5718232,2.40617867 24.1814428,2.2351178 24.6629519,2.50561262 C24.6681837,2.50855168 24.673389,2.51153779 24.6785671,2.51457056 L30.2152447,5.75736369 C30.689889,6.03535949 30.850899,6.64450404 30.5756101,7.12072339 L26.5410884,14.1' />
        <Path transform='translate(-1, 0)' d='M19.3058823,26.548712 L15.2922426,33.6568385 C15.0206918,34.1377529 14.4106983,34.3074756 13.9297839,34.0359249 C13.9294556,34.0357395 13.9291274,34.035554 13.9287993,34.0353682 L8.38060649,30.8942713 C7.89999957,30.6221768 7.73096688,30.0119917 8.0030614,29.5313848 C8.00649499,29.52532 8.00999188,29.5192912 8.01355151,29.5132995 L12.2173038,22.4373696' />
        <Path transform='translate(-1, 0)' d='M16.8,22.4373696 L3.8,22.4373696 C3.24771525,22.4373696 2.8,21.9896544 2.8,21.4373696 L2.8,15.1 C2.8,14.5477153 3.24771525,14.1 3.8,14.1 L11.8,14.1' />
        <Path transform='translate(-1, 0)' d='M26.5066683,22.4373696 L34.8,22.4373696 C35.3522847,22.4373696 35.8,21.9896544 35.8,21.4373696 L35.8,15.1 C35.8,14.5477153 35.3522847,14.1 34.8,14.1 L21.8,14.1' />
        <Path transform='translate(-1, 0)' d='M15.4670718,3.31922035 L30.365307,29.1237209 C30.7795206,29.8411598 30.5337079,30.7585454 29.8162689,31.172759 L25.1937311,33.8415825 C24.4762921,34.255796 23.5589065,34.0099833 23.144693,33.2925444 L8.24645763,7.48804388 C7.83224406,6.77060495 8.07805679,5.85321933 8.79549574,5.43900578 L13.4180337,2.77018224 C14.1354727,2.35596868 15.0528583,2.60178142 15.4670718,3.31922035 Z' />
      </Svg>

    case 'reams':
      return <Svg 
        width={fontScale(28)}
        height={fontScale(21)}
        viewBox='0 0 86 62'
        style={{
          top: 3
        }}>
        <G stroke='none' strokeWidth='1' fill='none' fill-rule='evenodd'>
              <G transform='translate(0, -18)'>
                <Path d='M51.7684022,18.2939028 L85.0581178,31.0727549 C86.2802996,31.5611922 86.3471768,33.396598 85.0581178,34.0559741 L38.5512823,55.4411725 C37.2028121,56.0037476 35.1177522,56.0534077 33.8967237,55.5561561 L0.770060627,42.550983 C-0.414524331,42.1048732 -0.191043463,40.4637918 1.1562602,39.9051095 L47.2911351,18.6878639 C48.5803325,18.0347765 50.5837037,17.8566457 51.7684022,18.2939028 Z' fill={backgroundColor} />
                <Path d='M17.4077967,42.8900122 C18.0659162,43.324396 18.6761466,43.7492468 19.2384363,44.164475 C19.8011218,44.5803062 20.2924777,45.0123849 20.7124556,45.4606358 L18.8741305,46.263448 L4,40.4455001 L5.83798443,39.6451802 C7.08565925,39.7790823 8.19061231,39.9450951 9.15288214,40.1432814 C10.1155167,40.3419509 11.0574083,40.5503655 11.9785936,40.7685508 L49.0021119,23.4318088 C48.2291004,22.9534917 47.6002849,22.5040235 47.1154227,22.0830686 C46.6309054,21.6626362 46.2320531,21.266261 45.9187393,20.8937625 L47.7011824,20 L52.6618581,21.8992705 C54.1685427,22.4796877 55.9001829,23.0758497 57.8573129,23.6884049 C59.816697,24.3040856 61.6491122,24.945761 63.3544592,25.6132877 C65.2137318,26.3434738 66.7267317,27.1422259 67.8929329,28.0088636 C69.0608179,28.8780402 69.7446462,29.7965687 69.9436046,30.7628612 C70.1422466,31.7296536 69.8162287,32.7265068 68.9639879,33.7514501 C68.1102521,34.7741147 66.610785,35.8113632 64.4640114,36.8605494 C61.4443258,38.3235742 58.2000162,39.2302476 54.7351259,39.5866758 C51.2688396,39.9396853 47.8395156,39.8160242 44.4510184,39.2219643 C43.2506203,41.194492 42.1433156,43.1816717 41.1294731,45.1842148 C40.1120493,47.1812813 39.1886698,49.1945327 38.3597274,51.2247136 L39.6305478,53.305435 L38.0451155,54 L31.0912634,51.1628927 L30.6895609,49.5052496 C31.0990228,48.4244134 31.57135,47.3946902 32.1064676,46.4158912 C32.6406749,45.4356764 33.2520447,44.4674267 33.9404356,43.5108456 C34.6277017,42.5524954 35.3822644,41.6017216 36.20401,40.6582663 C37.0244467,39.7127395 37.9280266,38.7179252 38.9144627,37.6732909 L33.5775449,35.5756578 L17.4077967,42.8900122 Z M58.798629,27.3720875 C57.8859055,27.0111711 57.1146592,26.7252111 56.4846099,26.513825 C55.854803,26.3027811 55.2314791,26.1315403 54.6145576,26 L36,35.1060142 L40.1030153,36.7331004 C42.7305552,37.7815594 45.7380475,38.1811455 49.121386,37.9248196 C52.5039419,37.6660777 55.6926245,36.8086433 58.6830602,35.3457895 C61.7495098,33.8304694 63.1805577,32.3757988 62.9818267,30.9911796 C62.7833598,29.6071593 61.3878618,28.3992611 58.798629,27.3720875 Z' fill={borderColor} />
                <Path d='M1.03614458,48.1916296 C21.830632,57.5008122 33.5311325,62.1554036 36.1376459,62.1554036 C38.7441594,62.1554036 55.0195625,54.8642955 84.9638554,40.2820793' stroke={backgroundColor} strokeWidth='4' strokeLinecap='round' />
                <Path d='M1.03614458,56.5317117 C21.9597019,65.8408943 33.7247373,70.4954856 36.3312508,70.4954856 C38.9377642,70.4954856 55.1486324,63.2043776 84.9638554,48.6221614' stroke={backgroundColor} strokeWidth='4' strokeLinecap='round' />
                <Path d='M1.03614458,64.1774025 C21.9597019,73.4865852 33.7247373,78.1411765 36.3312508,78.1411765 C38.9377642,78.1411765 55.1486324,70.8500684 84.9638554,56.2678523' stroke={backgroundColor} strokeWidth='4' strokeLinecap='round' />
              </G>
        </G>
      </Svg>

    case 'readwise':
      return <Svg 
        width={fontScale(28)}
        height={fontScale(28)}
        viewBox="0 0 50 50" 
        fill="none">
        <Path d="M36.2225 35.7866C37.2767 37.5404 38.1366 38.1234 39.8953 38.3323V40.0861H31.2186L23.091 26.527H21.0603V35.4174C21.0603 37.7979 21.6481 38.1282 24.15 38.3371V40.0909H11.0525V38.3371C13.5544 38.1282 14.1423 37.793 14.1423 35.4174V15.5524C14.1423 13.1331 13.6322 12.8416 11.0525 12.6327V10.8789H24.5338C32.6615 10.8789 36.9075 12.589 36.9075 18.5985C36.9075 23.1457 34.6971 25.3173 30.2422 26.0655L36.2225 35.7866ZM22.2311 13.7161C21.5266 13.7161 21.0603 14.2164 21.0603 14.9695V23.6898H24.4221C27.9005 23.6898 29.9701 22.4364 29.9701 18.5985C29.9701 14.7168 27.9005 13.7161 24.5387 13.7161H22.2311Z" fill={backgroundColor} />
        <Path d="M31.3451 11.918H18.7042V23.9856H31.3451V11.918Z" fill={backgroundColor}/>
        <Path d="M29.7184 14.0234C29.0334 15.2914 30.0925 21.2669 30.0925 21.2669C30.1071 21.5827 29.8933 21.8596 29.5824 21.9276C29.5824 21.9276 23.1016 21.9568 20.9543 23.7446" fill={borderColor} />
      </Svg>

    // case 'saved':
    //   return <Svg 
    //     width={fontScale(32)} 
    //     height={fontScale(32)} 
    //     viewBox='0 0 32 32'>
    //     <G strokeWidth='1'  stroke='none' fill='none' fillRule='evenodd'>
    //       <G transform='translate(-1.000000, -3.000000)'>
    //         <G transform='translate(1.000000, 3.000000)'>
    //           <Path fill={borderColor} opacity={0.8} d='M 2 7 L 2 27 C 2 29 3 30 5 30 L 27 30 C 29 30 30 29 30 27 L 30 7 M 0 6 L 0 2 C 0 2 0 0 2 0 L 30 0 C 32 0 32 2 32 2 V 6 Z' />
    //           <Path stroke={backgroundColor} fill={borderColor} d='M 12 26 L 12 12 C 12 10 12 10 14 10 H 18 C 20 10 20 10 20 12 V 26 L 16 22 Z' />
    //           <Path stroke={backgroundColor} opacity={0.5} d='M 14 14 H 18 M 14 16 H 18 M 14 18 H 18' />
    //         </G>
    //       </G>
    //     </G>
    //   </Svg>

    case 'unread':
      return <Svg 
        width={fontScale(30)} 
        height={fontScale(26)} 
        viewBox='0 0 30 26'>
        <G stroke='none' strokeWidth='1' fill='none' strokeLinecap='round' strokeLinejoin='round'>
          <G transform='translate(-2.000000, -8.000000)' strokeWidth='2'>
            <G transform='translate(3.000000, 3.000000)'>
              <Path stroke={borderColor} strokeWidth='3' d='M0,22 L0,27 C0,28.65 1.4,30 3.11111111,30 L24.8888889,30 C26.6071081,30 28,28.6568542 28,27 L28,22' />
              <Path strokeOpacity='0.7' stroke={borderColor} strokeWidth='1' d='M3,24 L25,24 M3,27 L25,27 M3,18 L25,18 M3,21 L25,21 M3,12 L25,12 M3,15 L25,15 M3,6 L25,6 M3,9 L25,9' />
            </G>
          </G>
        </G>
      </Svg>

    case 'rss':
      return <Svg 
        width={fontScale(32)}  
        height={fontScale(32)} 
        viewBox='0 0 24 24' 
        fill='none' 
        stroke={borderColor} 
        strokeWidth='3' 
        strokeLinecap='round' 
        strokeLinejoin='round'>
        <Path d='M4 11a9 9 0 0 1 9 9' />
        <Path d='M4 4a16 16 0 0 1 16 16' />
        <Circle cx='5' cy='19' r='1' />
      </Svg>

    case'back':
      return <Svg 
        width={fontScale(32)}
        height={fontScale(32)}
        viewBox='0 0 24 24'
        fill='none'
        stroke={borderColor}
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'>
        <Path d='M15 18l-6-6 6-6'/>
      </Svg>

    case 'forward':
      return <Svg
        width={fontScale(32)}
        height={fontScale(32)}
        viewBox='0 0 24 24'
        fill='none'
        stroke={borderColor}
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'>
        <Path d='M9 18l6-6-6-6'/>
      </Svg>

    case 'x':
      return <Svg
        width={fontScale(32)}
        height={fontScale(32)}
        viewBox='0 0 24 24'
        fill='none'
        stroke={borderColor}
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'>
        <Line x1="18" y1="6" x2="6" y2="18" />
        <Line x1="6" y1="6" x2="18" y2="18" />
      </Svg>
    
    case 'highlights':
      return <Svg
        width={fontScale(32)}
        height={fontScale(32)}
        viewBox='0 0 24 24'
        fill='none'
        stroke={borderColor}
        strokeWidth='3'
        strokeLinecap='square'
        strokeLinejoin='square'>
        <Path d="M20 4.5H3" strokeWidth={1}/>
        <Path d="M21 14.5H10" strokeWidth={1}/>
        <Path d="M10 14.5H3" />
        <Path d="M19 9.5H7"/>
        <Path d="M19 9.5H3" strokeWidth={1}/>
        <Path d="M16 19.5H3" strokeWidth={1}/>
      </Svg>

    case 'saved':
      return <Svg
        width={fontScale(32)}
        height={fontScale(32)}
        viewBox='0 0 32 32'
        fill='none' 
        stroke={borderColor}
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <Path d="M17 25L19 7" strokeWidth={4}/>
        <Path d="M23 25L25 7" strokeWidth={4}/>
        <Path d="M6 25L13 10" strokeWidth={4}/>
        <Line x1="3" y1="28.5" x2="29" y2="28.5"/>
        {/* <Line x1="28.5" y1="3" x2="28.5" y2="29"/> */}
      </Svg>

  }
}
