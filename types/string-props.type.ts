type StringProps =
  | {
      plainText: string;
    }
  | {
      localeKey: string;
      localeProps?: { [key: string]: string | number | boolean };
    };

export default StringProps;
