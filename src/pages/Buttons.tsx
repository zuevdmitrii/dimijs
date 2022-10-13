import React from 'react';
import {Button} from '../lib/components/Button';
import {IconButton} from '../lib/components/IconButton';
import styles from './Buttons.module.scss';
import {Template} from './Template';

export const Buttons = () => {
  return (
    <Template>
      <>
        <h1>Buttons</h1>
        <div className={styles.setOfButtons}>
          <Button caption="Caption" />
          <Button
            caption="Long caption with fixed width"
            className={styles.fixedButton}
          />
          <IconButton
            caption="Test Icon Button"
            iconSetName="navigation"
            iconId="expandMore"
          />
          <IconButton
            caption="Different Icon Button"
            iconSetName="action"
            iconId="search"
          />
          <IconButton
            caption="Test Icon Button With Long Caption"
            iconSetName="navigation"
            iconId="expandMore"
            className={styles.fixedButton}
          />
          {[undefined, 'sm' as 'sm', 'lg' as 'lg'].map((size) => {
            return [undefined, 'primary' as 'primary', 'light' as 'light'].map(
              (color) => {
                return (
                  <>
                    <IconButton
                      caption={`Icon with ${size || 'def'} size ${color || ''}`}
                      iconSetName="action"
                      iconId="search"
                      size={size}
                      color={color}
                    />
                    <Button
                      size={size}
                      color={color}
                      caption={`Button  with ${size || 'def'} size ${
                        color || ''
                      }`}
                    />
                  </>
                );
              }
            );
          })}
        </div>
      </>
    </Template>
  );
};
