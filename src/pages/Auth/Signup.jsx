import React, { useState } from 'react'
import Button from "react-bootstrap/Button";
import axios from 'axios';
import Form from "react-bootstrap/Form";
import { Link, useNavigate } from "react-router-dom";

export const Signup = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault()
        axios.post("http://localhost:3001/register", {name,email,password})
        .then(result => {console.log('Details Submitted By Submit')
         // Clear the input fields
                setName("");
                setEmail("");
                setPassword("");

            // Navigation after Successful SignUp
              navigate("/");

            })
        .catch(err => console.log("Error in the Submit"+ err))
    }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
  <div
    className="p-4 rounded shadow"
    style={{ minWidth: "300px", maxWidth: "400px", backgroundColor: "whitesmoke" }}>
    <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicUserName">
        <Form.Label>User Name</Form.Label>
        <Form.Control type="text" value={name} placeholder="Enter Your Name"  onChange={(e)=> setName(e.target.value)} />
        </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control type="email" value={email} placeholder="Enter email" onChange={(e)=> setEmail(e.target.value)} />
        
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" value={password} placeholder="Password" onChange={(e)=> setPassword(e.target.value)} />
      </Form.Group>
      
      <Button className="mb-3 w-100" variant="primary" type="submit">
        Submit
      </Button>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        
        <Form.Text className="text-muted">
          Already Have Account? 
          <Link to="/login">Log In</Link>
        </Form.Text>
      </Form.Group>
    </Form>
    </div>
    </div>
  )
}