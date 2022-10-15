import React, {useCallback, useState} from 'react';
import styles from './ButtonBase.module.scss';
import {Link} from 'react-router-dom';
import cn from 'classnames';

export interface IButtonBaseProps {
  children: JSX.Element;
  className?: string;
  onClick?: () => void | Promise<unknown>;
  ariaLabel?: string;
  disabled?: boolean;
  href?: string;
  size?: 'sm' | 'lg';
  color?: 'primary' | 'light';
  type?: 'button' | 'submit' | 'reset';
}
export const ButtonBase = (props: IButtonBaseProps) => {
  const {onClick} = props;
  const [clickProcess, setClickProcess] = useState(false);
  const onClickHdl = useCallback(
    (ev: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (onClick) {
        ev.stopPropagation();
        const maybePromise = onClick();
        if (maybePromise && !!maybePromise.then) {
          setClickProcess(true);
          maybePromise.then(() => setClickProcess(false));
        }
      }
    },
    [onClick]
  );
  const tagProps = {
    className: cn(
      styles.root,
      props.className,
      props.size && styles[`btn--${props.size}`],
      props.color && styles[`btn--${props.color}`],
      (props.disabled || clickProcess) && styles[`btn--disabled`]
    ),
    'area-label': props.ariaLabel,
    onClick: onClickHdl,
  };
  if (props.href && !props.disabled && !clickProcess) {
    return (
      <Link to={props.href} {...tagProps}>
        {props.children}
      </Link>
    );
  }
  return (
    <button
      type={props.type || 'button'}
      {...tagProps}
      disabled={props.disabled || clickProcess}
    >
      {props.children}
    </button>
  );
};
