import React, {useMemo} from 'react';
import {IButtonProps} from './Button';
import {ButtonBase} from './ButtonBase';
import {Icon, IIconProps} from './Icon';
import styles from './IconButton.module.scss';

type IIconPropsMapped<T extends iconTypes> = {
  [Property in keyof IIconProps<T> as `icon${Capitalize<Property>}`]: IIconProps<T>[Property];
};
interface IIconButtonProps<T extends iconTypes>
  extends IButtonProps,
    IIconPropsMapped<T> {
  caption: string;
}

export const getPxFromSize = (size?:IButtonProps['size'])=>{
  switch (size) {
    case 'lg':
      return {width: 24, height: 24};
    case 'sm':
      return {width: 12, height: 12};
  }
  return {width: 16, height: 16};
}

export const IconButton: <T extends iconTypes>(
  props: IIconButtonProps<T>
) => JSX.Element = (props) => {
  const size = useMemo(() => getPxFromSize(props.size), [props.size]);
  return (
    <ButtonBase {...props} ariaLabel={props.ariaLabel||props.caption}>
      <>
        <Icon
          setName={props.iconSetName}
          id={props.iconId}
          {...size}
          className={styles.svgIcon}
        />
        {props.caption && <span>{props.caption}</span>}
      </>
    </ButtonBase>
  );
};
