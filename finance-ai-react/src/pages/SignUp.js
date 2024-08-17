import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import React, {useState} from "react"
import axios from "axios"

const SignUp = () => {

    const [emailInput, setEmailInput] = useState("");
    const [usernameInput, setUsernameInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [confirmInput, setConfirmInput] = useState("");

    const [passwordErrors, setPasswordErrors] = useState([]);
    const [passwordInvalid, setPasswordInvalid] = useState(false);
    const [confirmError, setConfirmError] = useState("");
    const [confirmInvalid, setConfirmInvalid] = useState(false);

    const [signUpResponse, setSignUpResponse] = useState("");
    const [signUpTextColor, setSignUpTextColor] = useState("");

    const handleSubmit = (event) => {
      event.preventDefault();
      console.log('Form submitted with values:', {
        emailInput,
        usernameInput,
        passwordInput,
        confirmInput
      });
      if(!passwordInvalid && !confirmInvalid){
        const data = ("user:", {emailInput, usernameInput, passwordInput, confirmInput});
        axios.post("https://127.0.0.1:8000/user/signup/", data)
        .then(response => {
          if(response.data.message == "User created successfully"){
            console.log("Sign up: success");
            setSignUpResponse("Sign up: success");
            setSignUpTextColor("text-success");
          }
          else{
            console.log("Sign up: failed");
            setSignUpResponse("Sign up: failed");
            setSignUpTextColor("text-danger");
          }
        })
        .catch(error => {
          console.error('Error signing up, please try again.', error);
          setSignUpResponse("Account already exists with the submitted email or username");
          setSignUpTextColor("text-danger");
        });
      }
    };

    const validatePassword = (event) => {
      setPasswordInvalid(false)

      const password = event.target.value;
      setPasswordInput(password);
      const errors = [];
      if (password.length < 8) {
        errors.push("Password must be at least 8 characters long.");
      }
      if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter.");
      }
      if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter.");
      }
      if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one digit.");
      }
      if (!/[!@#$%^&*()_+{}\[\]:;"'<>,.?\/\\|`~]/.test(password)) {
        errors.push("Password must contain at least one special character.");
      }
      setPasswordErrors(errors);
      if(errors.length != 0){
        setPasswordInvalid(true);
      }
    };

    const confirmMatch = (event) => {
      setConfirmInvalid(false)
      const password = event.target.value;
      setConfirmInput(password);
      var errors = "";
      if (password != passwordInput){
        errors = "Passwords do not match.";
        setConfirmInvalid(true);
      }
      setConfirmError(errors);
    }

    return (
      <>
      <h1>Sign Up</h1>
      {
      <Form onSubmit={handleSubmit}>
        <Form.Label>Email</Form.Label>
        <Form.Control required onChange={e => setEmailInput(e.target.value)} type="email" name="emailInput" value={emailInput}/>
        <Form.Label>Username</Form.Label>
        <Form.Control required onChange={e => setUsernameInput(e.target.value)} type="text" name="usernameInput" value={usernameInput}/>
        <Form.Label>Password</Form.Label>
        <Form.Control required isInvalid={passwordInvalid} onChange={validatePassword} type="password" name="passwordInput" value={passwordInput}/>
        <Form.Control.Feedback type="invalid">
          {passwordErrors.map((error, index) => (
              <div key={index}>{error}</div>
          ))}
        </Form.Control.Feedback>
        <Form.Label>Confirm Password</Form.Label>
        <Form.Control required isInvalid={confirmInvalid} onChange={confirmMatch} type="password" name="confirmInput" value={confirmInput}/>
        <Form.Control.Feedback type="invalid">{confirmError}</Form.Control.Feedback>
        <Button disabled={passwordInvalid||confirmInvalid} className="mt-3" type="submit">Sign up</Button>
      </Form>
      }
      <div className={signUpTextColor}>
      {signUpResponse}
      </div>
      </>
    )
  };
  
  export default SignUp;