import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AuthApi from "../../api/AuthApi";

function RegisterForm() {
  const initialState = {
    username: "",
    email: "",
    password: "",
    confPassword: "",
  };
  const [data, setData] = useState(initialState);
  const { username, email, password, confPassword } = data;
  const [msg, setMsg] = useState([]);
  const navigate = useNavigate();

  function handleChange(e) {
    setData({ ...data, [e.target.name]: e.target.value });
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await AuthApi.register(data);
      navigate("/");
    } catch (error) {
      console.log(error.response);
      const errors = error.response.data.errors.split(".");
      if (error.response) {
        setMsg(errors);
      }
    }
  };
  return (
    <div className="w-full max-w-lg p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700 mx-auto my-20">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <ul>
          {msg.map((message, index) => {
            return (
              <li key={index} className="text-red-600">
                - {message}
              </li>
            );
          })}
        </ul>

        <h5 className="text-xl font-medium text-gray-900 dark:text-white">
          Sign up to our platform
        </h5>
        <div>
          <label
            htmlFor="username"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Username
          </label>
          <input
            type="text"
            name="username"
            id="username"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            placeholder="username"
            value={username}
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            placeholder="name@company.com"
            value={email}
            onChange={handleChange}
          />
        </div>
        <div className="grid md:grid-cols-2 md:gap-6">
          <div className="relative z-0 w-full mb-5 group">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              value={password}
              onChange={handleChange}
            />
          </div>
          <div className="relative z-0 w-full mb-5 group">
            <label
              htmlFor="confirmPassword"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Confirm your password
            </label>
            <input
              type="password"
              name="confPassword"
              id="confPassword"
              placeholder="••••••••"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              value={confPassword}
              onChange={handleChange}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Register
        </button>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
          Account is already?{" "}
          <Link
            to="/"
            className="text-blue-700 hover:underline dark:text-blue-500"
          >
            Login now!
          </Link>
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;
