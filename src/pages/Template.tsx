import React from 'react';
import {IconButton} from '../lib/components/IconButton';
import styles from './Template.module.scss';

interface ITemplateProps {
  children: JSX.Element;
}
export const Template = (props: ITemplateProps) => {
  return (
    <div>
      <div className={styles.head}>
        <IconButton
          iconSetName="navigation"
          iconId="chevronLeft"
          caption="Back"
          href="/"
        />
      </div>
      {props.children}
    </div>
  );
};
