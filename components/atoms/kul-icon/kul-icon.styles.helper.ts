const getStyles = (type: 'L' | 'M' | 'S') => {
  switch (type) {
    case 'L':
      return {
        innerTextClasses: ['text-primary-100', 'rest-of-class-names'],
        wrapperClasses: ['py-5', 'my-custom-class'],
      };
    case 'M':
      return {};
    case 'S':
  }
};
