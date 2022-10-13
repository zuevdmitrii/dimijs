import React, {useCallback} from 'react';
import styles from './ButtonBase.module.scss';
import {Link} from 'react-router-dom';
import cn from 'classnames';

export interface IButtonBaseProps {
  children: JSX.Element;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
  href?: string;
  size?: 'sm' | 'lg';
  color?: 'primary' | 'light';
}
export const ButtonBase = (props: IButtonBaseProps) => {
  const onClick = useCallback(
    (ev: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (props.onClick) {
        ev.stopPropagation();
        props.onClick();
      }
    },
    [props.onClick]
  );
  const tagProps = {
    className: cn(
      styles.root,
      props.className,
      props.size && styles[`btn--${props.size}`],
      props.color && styles[`btn--${props.color}`],
    ),
    'area-label': props.ariaLabel,
    onClick,
  };
  if (props.href) {
    return (
      <Link to={props.href} {...tagProps}>
        {props.children}
      </Link>
    );
  }
  return (
    <button type="button" {...tagProps}>
      {props.children}
    </button>
  );
};
