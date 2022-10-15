import React, {useState} from 'react';
import {Input} from '../lib/components/Input';
import styles from './Inputs.module.scss';
import {Template} from './Template';

export const Inputs = () => {
  const [i1, setI1] = useState('');
  return (
    <Template>
      <>
        <h1>Inputs</h1>
        <div className={styles.setOfInputs}>
          <Input value={i1} onChange={setI1} />
          <Input value={i1} onChange={setI1} placeholder={'with placeholder'} />
          <Input
            value={i1}
            onChange={setI1}
            className={styles.inputW150}
            placeholder={'long long long placeholder for input'}
          />
          <Input value={i1} onChange={setI1} className={styles.inputW300} />
          <Input value={i1} onChange={setI1} name={'login'} />
        </div>
        <div className={styles.setOfInputs}>
          <Input
            value={i1}
            onChange={setI1}
            name={'login'}
            placeholder={'With label'}
            label={'Please provide some info'}
          />
          <Input
            value={i1}
            onChange={setI1}
            name={'login'}
            placeholder={'With long label'}
            label={'Please provide some info. This is long label'}
          />
        </div>
        <div className={styles.setOfInputs}>
          <Input
            className={styles.inputW150}
            value={i1}
            onChange={setI1}
            name={'login'}
            placeholder={'With long label'}
            label={'Please provide some info. This is long label'}
          />
        </div>
      </>
    </Template>
  );
};
