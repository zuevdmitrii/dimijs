import React from 'react';
import styles from './Input.module.scss';
import cn from 'classnames';

export interface IInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  placeholder?: string;
  name?: string;
  title?: string;
  disabled?: boolean;
  type?: 'number';
  size?: 'sm' | 'lg';
}
export const Input: (props: IInputProps) => JSX.Element = (props) => {
  return (
    <div
      className={cn(
        styles.root,
        props.className,
        props.size && styles[`input--${props.size}`]
      )}
    >
      {props.label && <label>{props.label}</label>}
      <input
        type={props.type}
        value={props.value}
        name={props.name}
        placeholder={props.placeholder}
        title={props.title}
        aria-label={props.title||props.name}
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
        disabled={props.disabled}
      />
    </div>
  );
};
