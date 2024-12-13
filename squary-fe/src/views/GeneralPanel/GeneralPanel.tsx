import PanelOptions from '../../components/PanelOptions/PanelOptions'; // Asegúrate de tener la ruta correcta
import AdditionalSection1 from '../../components/PanelOptions/InoPanel/AdditionalSection1';
import AdditionalSection2 from '../../components/PanelOptions/InoPanel/AdditionalSection2';
const GeneralPanel = () => {
  return (
    <div>
      <PanelOptions />
      <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
        <AdditionalSection1 />
        <AdditionalSection2 />
      </div>
    </div>

  );
}

export default GeneralPanel;
