type ColorVariant =
  | 'primary'
  | 'secondary'
  | 'alternate'
  | 'error'
  | 'success'
  | 'warning'
  | 'white'
  | 'black';
type ColorShade = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

type AppColor = `${ColorVariant}-${ColorShade}`;

export default AppColor;
