import { createAppKit } from '@reown/appkit';

export const initializeAppKit = () => {
  createAppKit({
    themeVariables: {
      '--w3m-accent': '#000', // Cambia el color principal del botón
    },
  });
};
