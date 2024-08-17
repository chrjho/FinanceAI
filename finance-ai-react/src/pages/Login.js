import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import React, { useState, useContext} from "react"
import axios from "axios"
import { useNavigate,Link } from "react-router-dom";
import Cookies from "universal-cookie"
import { AuthContext } from '../AuthProvider';

const Login = () => {

    const [usernameInput, setusernameInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");

    const [loginResponse, setLoginResponse] = useState("");
    const [loginTextColor, setLoginTextColor] = useState("");

    const navigate = useNavigate();
    const cookies = new Cookies();
    const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);

    const handleSubmit = (event) => {
      event.preventDefault();
      const data = ("user:", {usernameInput, passwordInput});
      axios.post("https://127.0.0.1:8000/user/login/", data, { withCredentials: true })
      .then(response => {
        if(response.data.message == "Login successful!"){
          console.log("Login: success");
          setLoginResponse("Login: success");
          setLoginTextColor("text-success");
          const cookies = new Cookies();
          const headers = response.headers;
          let access = headers.get("Authorization").split(" ")[1];
          cookies.set("access", access, {httpOnly: false, secure: true, path: "/", maxAge: 60 * 60 * 24 * 365});
          let refresh = headers.get("X-Refresh").split(" ")[1];
          // cookies.set("refresh", refresh, {httpOnly: true, secure: true, path: "/"});
          console.log("Refresh: " + refresh);

          let token = cookies.get("access");
          console.log("Token:", token);
          if (token==null||token=="") {
              setIsAuthenticated(false);
          } else {
              setIsAuthenticated(true);
          }
          
          navigate("/");
        }
        else{
          console.log("Login: failed");
          setLoginResponse("Incorrect credentials please try again.");
          setLoginTextColor("text-danger");
        }
      })
      .catch(error => {
        console.error('Error logging in, please try again.', error);
        setLoginResponse("Login: failed");
        setLoginTextColor("text-danger");
      });
    };

    return (
      <>
      <h1>Login</h1>
      {
      <Form onSubmit={handleSubmit}>
        <Form.Label>Username</Form.Label>
        <Form.Control required onChange={e => setusernameInput(e.target.value)} type="text" name="usernameInput" value={usernameInput}/>
        <Form.Label>Password</Form.Label>
        <Form.Control required onChange={e => setPasswordInput(e.target.value)} type="password" name="passwordInput" value={passwordInput}/>
        <Button className="mt-3" type="submit">Login</Button>
        <Link to="/signup">Don't have an account? Sign up!</Link>
      </Form>
      }
      <div className={loginTextColor}>
      {loginResponse}
      </div>
      </>
    );
  };
  
  export default Login;