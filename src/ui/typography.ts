export const chathuraWeights = {
  thin: 100,        
  light: 300,       
  normal: 400,     
  bold: 700,        
  extrabold: 800   
};

export const bitterWeights = {
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500
};

export const fonts = {
  primary: `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  `,
  
  mono: `
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
  `,
  
  custom: `
    font-family: 'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  `,
  
  heading: `
    font-family: 'Poppins', 'Inter', 'Roboto', sans-serif;
  `,
  
  brand: `
    font-family: 'Orbitron', 'Roboto Mono', monospace;
  `,
  
  chathura: `
    font-family: 'Chathura', 'Arial', sans-serif;
  `,
  
  bitter: `
    font-family: 'Bitter', 'Georgia', serif;
  `,
  
  chathuraThin: `
    font-family: 'Chathura', 'Arial', sans-serif;
    font-weight: ${chathuraWeights.thin};
  `,
  
  chathuraLight: `
    font-family: 'Chathura', 'Arial', sans-serif;
    font-weight: ${chathuraWeights.light};
  `,
  
  chathuraRegular: `
    font-family: 'Chathura', 'Arial', sans-serif;
    font-weight: ${chathuraWeights.normal};
  `,
  
  chathuraBold: `
    font-family: 'Chathura', 'Arial', sans-serif;
    font-weight: ${chathuraWeights.bold};
  `,
  
  chathuraExtraBold: `
    font-family: 'Chathura', 'Arial', sans-serif;
    font-weight: ${chathuraWeights.extrabold};
  `,
  
  bitterExtraLight: `
    font-family: 'Bitter', 'Georgia', serif;
    font-weight: ${bitterWeights.extralight};
  `,
  
  bitterLight: `
    font-family: 'Bitter', 'Georgia', serif;
    font-weight: ${bitterWeights.light};
  `,
  
  bitterRegular: `
    font-family: 'Bitter', 'Georgia', serif;
    font-weight: ${bitterWeights.normal};
  `,
  
  bitterMedium: `
    font-family: 'Bitter', 'Georgia', serif;
    font-weight: ${bitterWeights.medium};
  `
};

export const fontWeights = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900
};

export const fontSizes = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '36px'
};

export const fontVariables = `
  :root {
    --font-primary: ${fonts.primary.replace('font-family:', '').replace(';', '')};
    --font-mono: ${fonts.mono.replace('font-family:', '').replace(';', '')};
    --font-custom: ${fonts.custom.replace('font-family:', '').replace(';', '')};
    --font-heading: ${fonts.heading.replace('font-family:', '').replace(';', '')};
    --font-brand: ${fonts.brand.replace('font-family:', '').replace(';', '')};
    --font-chathura: ${fonts.chathura.replace('font-family:', '').replace(';', '')};
    
    --font-weight-thin: ${fontWeights.thin};
    --font-weight-extralight: ${fontWeights.extralight};
    --font-weight-light: ${fontWeights.light};
    --font-weight-normal: ${fontWeights.normal};
    --font-weight-medium: ${fontWeights.medium};
    --font-weight-semibold: ${fontWeights.semibold};
    --font-weight-bold: ${fontWeights.bold};
    --font-weight-extrabold: ${fontWeights.extrabold};
    --font-weight-black: ${fontWeights.black};
    
    --font-size-xs: ${fontSizes.xs};
    --font-size-sm: ${fontSizes.sm};
    --font-size-base: ${fontSizes.base};
    --font-size-lg: ${fontSizes.lg};
    --font-size-xl: ${fontSizes.xl};
    --font-size-2xl: ${fontSizes['2xl']};
    --font-size-3xl: ${fontSizes['3xl']};
    --font-size-4xl: ${fontSizes['4xl']};
  }
`;

export const fontHelpers = {
  primary: () => fonts.primary,
  mono: () => fonts.mono,
  custom: () => fonts.custom,
  heading: () => fonts.heading,
  brand: () => fonts.brand,
  chathura: () => fonts.chathura,
  chathuraThin: () => fonts.chathuraThin,
  chathuraLight: () => fonts.chathuraLight,
  chathuraRegular: () => fonts.chathuraRegular,
  chathuraBold: () => fonts.chathuraBold,
  chathuraExtraBold: () => fonts.chathuraExtraBold
};
