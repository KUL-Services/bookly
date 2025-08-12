import React from 'react';
import PressableProps from './pressable.props';

const Pressable = ({ ...restProps }: PressableProps) => {
  return <button {...restProps}></button>;
};

export default Pressable;
