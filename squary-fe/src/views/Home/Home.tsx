import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../utils/UserContext'; // Import your UserContext
import styles from './Home.module.css';
import ParticleBackground from '@/components/background';

const Home = () => {
    const navigate = useNavigate();
    const { isConnected } = useUser(); // Check connection state from your context
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
         if (isConnected && window.location.pathname === "/") {
           navigate("/dashboard");
         }
      }, [isConnected, navigate]);

    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth <= 768);
      handleResize();
      window.addEventListener('resize', handleResize);

      return () => window.removeEventListener('resize', handleResize);
    }, []);


    return  <div>
      <ParticleBackground />
      <div className={styles.navbar}>
        <div className={styles.navbar_container}>
          <div className={styles.navbar_logo}>
          <img src="logo.png" />
          </div>
          <div className={styles.navbar_items}>
          </div>
          <div className={styles.navbar_button}>
            <appkit-button />
           
          </div>
        </div>
      </div>
        {isMobile ? 
          <div style={{ position: 'absolute', top: '10%', left: '0%', color: '#000', textAlign: 'center' }}>
            <div className={styles.container_mobile}>
              <div className={styles.content_mobile}>
                <h1>Share moments, <br/> split expenses, <br/> pay smarter.</h1>
              </div>
              <div className={styles.image_mobile}>
                <img src="login-phone-image.png" /> 
              </div>
              <div className={styles.content_mobile}>
                <p>Make memories with your friends, and we’ll handle the rest.</p>
              </div>
            </div>
          </div>
        :
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#000', textAlign: 'center' }}>
            <div className={styles.container}>
              <div className={styles.content}>
                <h1>Share moments, <br/> split expenses, <br/> pay smarter.</h1>
                <p>Make memories with your friends, and we’ll handle the rest.</p>
              </div>  
              <div className={styles.image}>
                <img src="login-phone-image.png" /> 
              </div>
            </div>
          </div>
        }
  </div>
};


export default Home;