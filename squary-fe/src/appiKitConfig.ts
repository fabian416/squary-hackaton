import { createAppKit } from '@reown/appkit';

export const initializeAppKit = () => {
  // @ts-ignore: Ignorar el chequeo de tipos para la siguiente línea
  createAppKit({
    themeVariables: {
      '--w3m-accent': '#000', // Cambia el color principal del botón
    },
  });
};
