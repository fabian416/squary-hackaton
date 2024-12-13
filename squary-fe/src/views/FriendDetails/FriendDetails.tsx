import styles from './FriendDetails.module.css';

const FriendDetails = () => {
  // Supongamos que obtenemos algunos datos del amigo
  const friend = {
    name: "John Doe",
    email: "john@example.com"
  };

  return (
    <div className={styles.friendDetails}>
      <h1>Friend Details</h1>
      <p>Name: {friend.name}</p>
      <p>Email: {friend.email}</p>
    </div>
  );
};

export default FriendDetails;
