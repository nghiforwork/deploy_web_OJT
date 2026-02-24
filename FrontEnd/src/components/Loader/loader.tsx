import React from 'react';

import classNames from 'classnames';
import styles from './loader.module.scss';

type Props = {
  spinning: boolean;
  fullScreen: boolean;
};

const Loader = (props: Props) => {
  const { spinning, fullScreen } = props;
  return (
    <div
      className={classNames(styles.loader, {
        [styles.hidden]: !spinning,
        [styles.fullScreen]: fullScreen
      })}
    >
      <div className={styles.warpper}>
        <div className={styles.inner} />
        <div className={styles.text}>LOADING</div>
      </div>
    </div>
  );
};

export default Loader;
