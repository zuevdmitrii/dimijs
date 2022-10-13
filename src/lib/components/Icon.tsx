import React from 'react';

const XMLNS = 'http://www.w3.org/2000/svg';
export interface IIconProps<T extends iconTypes> {
  setName: T;
  id: listOfIcons[T];
  viewBox?: string;
  width?: number;
  height?: number;
  className?: string;
}
export const Icon: <T extends iconTypes>(
  props: IIconProps<T>
) => JSX.Element = (props) => {
  return (
    <svg
      className={props.className}
      width={props.width || 24}
      height={props.height || 24}
      xmlns={XMLNS}
      version="1.1"
      viewBox={props.viewBox}
    >
      <use xlinkHref={`/icons/${props.setName}.svg#${props.id}`} />
    </svg>
  );
};
