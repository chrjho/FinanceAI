import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../AuthProvider';

const Home = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
      console.log(isAuthenticated)
      if (!isAuthenticated) {
          navigate("/login")
      }
  }, [isAuthenticated, navigate]);
  
  if (isAuthenticated === undefined) {
    return null;
  }
  
  return <h1>Home</h1>;
};


export default Home;