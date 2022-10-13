import React from 'react';

interface IButtonProps {
  caption: string;
}
export const Button = (props: IButtonProps) => {
  return <button>{props.caption}</button>;
};
