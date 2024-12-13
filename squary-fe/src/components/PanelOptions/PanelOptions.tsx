import styles from './PanelOptions.module.css'; // Asegúrate de que el archivo CSS está correctamente vinculado

const PanelOptions = () => {
  return (
    <div className={styles.panelOptions}>
      <h1 className={styles.title}>Dashboard</h1>
      <div className={styles.buttonsContainer}>
      </div>
    </div>
  );
}

export default PanelOptions;
