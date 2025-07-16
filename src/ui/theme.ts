import colors from './colorsPalette';
import { fonts, fontWeights, fontSizes } from './typography';

export const theme = {
  colors,
  fonts,
  fontWeights,
  fontSizes,
  
  textStyles: {
    h1: `
      ${fonts.heading}
      font-weight: ${fontWeights.bold};
      font-size: ${fontSizes['4xl']};
    `,
    h2: `
      ${fonts.heading}
      font-weight: ${fontWeights.semibold};
      font-size: ${fontSizes['3xl']};
    `,
    h3: `
      ${fonts.heading}
      font-weight: ${fontWeights.semibold};
      font-size: ${fontSizes['2xl']};
    `,
    body: `
      ${fonts.custom}
      font-weight: ${fontWeights.normal};
      font-size: ${fontSizes.base};
    `,
    small: `
      ${fonts.custom}
      font-weight: ${fontWeights.normal};
      font-size: ${fontSizes.sm};
    `,
    button: `
      ${fonts.custom}
      font-weight: ${fontWeights.medium};
      font-size: ${fontSizes.sm};
    `,
    brand: `
      ${fonts.brand}
      font-weight: ${fontWeights.semibold};
      font-size: ${fontSizes.xl};
    `,
    code: `
      ${fonts.mono}
      font-size: ${fontSizes.sm};
    `,
    chathura: `
      ${fonts.chathura}
      font-weight: ${fontWeights.normal};
      font-size: ${fontSizes.base};
    `,
    chathuraThin: `
      ${fonts.chathuraThin}
      font-size: ${fontSizes.base};
    `,
    chathuraLight: `
      ${fonts.chathuraLight}
      font-size: ${fontSizes.base};
    `,
    chathuraRegular: `
      ${fonts.chathuraRegular}
      font-size: ${fontSizes.base};
    `,
    chathuraBold: `
      ${fonts.chathuraBold}
      font-size: ${fontSizes.base};
    `,
    chathuraExtraBold: `
      ${fonts.chathuraExtraBold}
      font-size: ${fontSizes.base};
    `
  }
};

export default theme;
