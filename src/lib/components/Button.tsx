import React from 'react';
import {ButtonBase, IButtonBaseProps} from './ButtonBase';
import styles from './Button.module.scss';

type RemoveChildrenFieldFromButton = {
  [Property in keyof IButtonBaseProps as Exclude<Property, "children">]: IButtonBaseProps[Property]
};

export interface IButtonProps extends RemoveChildrenFieldFromButton {
  caption: string;
}
export const Button = (props: IButtonProps) => {
  return (
    <ButtonBase {...props} ariaLabel={props.ariaLabel||props.caption}>
      <span className={styles.caption}>{props.caption}</span>
    </ButtonBase>
  );
};
