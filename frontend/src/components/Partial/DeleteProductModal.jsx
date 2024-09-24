import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthApi from "../../api/AuthApi";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function DeleteProductModal(props) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [alert, setAlert] = useState(false);
  const [msg, setMsg] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    props.fetch();
    // refreshToken();
    fetchData();
  }, []);

  const refreshToken = async () => {
    try {
      // const response = await axios.get("http://localhost:3000/api/token");
      const response = await AuthApi.refreshToken();
      setToken(response.data.accessToken);
      const decoded = jwtDecode(response.data.accessToken);
      setName(decoded.email);
      setExpire(decoded.exp);
    } catch (e) {
      if (e.response) {
        navigate("/");
      }
    }
  };

  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(
    async (config) => {
      const currentDate = new Date();
      if (expire * 1000 < currentDate.getTime()) {
        const response = await AuthApi.refreshToken();
        config.headers.Authorization = `Bearer ${response.data.accessToken}`;
        setToken(response.data.accessToken);
        const decoded = jwtDecode(response.data.accessToken);
        setName(decoded.email);
        setExpire(decoded.exp);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const fetchData = async () => {
    // const response = await ProductsApi.fetch(token);
    const response = await axiosJWT.get("http://localhost:3000/api/products", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setProducts(response.data.data);
  };

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const notify = () => {
    if (msg.length === 0) {
      toast.success("Product has been deleted", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
    setAlert(true);
    props.fetch();
  };

  const handleDelete = async (e) => {
    e.preventDefault();

    try {
      // props.refreshToken();
      props.fetch();
      toggleModal();
      await axios.delete(
        `http://localhost:3000/api/products/${props.productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      notify();
    } catch (error) {
      console.log(error.response);
    }
  };
  return (
    <>
      <button
        onClick={toggleModal}
        className="font-medium px-3 py-1 rounded text-white mr-1 bg-red-400"
        type="button"
      >
        Delete
      </button>
      {isOpen && (
        <div
          id="popup-modal"
          tabindex="-1"
          className="fixed top-0 right-0 bottom-0 left-0 z-50 flex justify-center items-center bg-black bg-opacity-50"
          onClick={toggleModal}
        >
          <div className="relative p-4 w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <button
                type="button"
                className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-hide="popup-modal"
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              <div className="p-4 md:p-5 text-center">
                <svg
                  className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this product?
                </h3>
                <button
                  onClick={handleDelete}
                  data-modal-hide="popup-modal"
                  type="button"
                  className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                >
                  Yes, I'm sure
                </button>
                <button
                  data-modal-hide="popup-modal"
                  type="button"
                  className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  No, cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DeleteProductModal;
