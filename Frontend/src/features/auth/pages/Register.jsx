import { useState } from "react";
import { useAuth } from "../hook/useAuth";

const Register = () => {
  const { handleRegister } = useAuth();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    contact: "",
    password: "",
    isSeller: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await handleRegister(formData);
  };

  return (
    <div>
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name</label>
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Contact</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              name="isSeller"
              checked={formData.isSeller}
              onChange={handleChange}
            />
            Register as Seller
          </label>
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;