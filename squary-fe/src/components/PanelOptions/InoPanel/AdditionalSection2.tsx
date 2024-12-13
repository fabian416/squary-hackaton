import styles from './AdditionalSection2.module.css';  

const AdditionalSection2 = () => {
  return (
    <div className={styles.container}>
    <div className={styles.additionalContainer}>
      <h2 className={styles.subTitle}>YOU ARE OWED</h2>
      <p>Nobody owns you right now!</p>
    </div>
    </div>
  );
}

export default AdditionalSection2;
