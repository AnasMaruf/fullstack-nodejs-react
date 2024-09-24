import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthApi from "../../api/AuthApi";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AddProductModal(props) {
  const initialState = {
    name: "",
    price: 0,
    description: "",
  };
  const [data, setData] = useState(initialState);
  const { name, price, description } = data;
  const [msg, setMsg] = useState([]);
  const [alert, setAlert] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");

  const [file, setFile] = useState("");
  const [preview, setPreview] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    refreshToken();
  }, []);

  const refreshToken = async () => {
    try {
      // const response = await axios.get("http://localhost:3000/api/token");
      const response = await AuthApi.refreshToken();
      setToken(response.data.accessToken);
      const decoded = jwtDecode(response.data.accessToken);
      setEmail(decoded.email);
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
        setEmail(decoded.email);
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

  const handleChange = async (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const notify = () => {
    if (msg.length === 0) {
      toast.success("Product has been created", {
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

  const loadImage = (e) => {
    console.log("loadImage called in AddProductModal");
    const image = e.target.files[0];
    setFile(image);
    setPreview(URL.createObjectURL(image));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("image_path", file);
    try {
      await axiosJWT.post("http://localhost:3000/api/products", formData, {
        headers: {
          "Content-type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      toggleModal();
      props.fetch();
      notify();
      setData(initialState);
      navigate("/dashboard");
    } catch (e) {
      const errors = e.response.data.errors.split(".");
      if (e.response) {
        setMsg(errors);
      }
    }
  };

  const toggleModal = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setData(initialState);
      setFile("");
      setPreview("");
    }
  };
  return (
    <>
      {/* Button to open modal */}
      <button
        onClick={toggleModal}
        className="block ml-1 my-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
      >
        Add Product
      </button>

      {/* Modal */}
      <div
        id="crud-modal"
        tabIndex="-1"
        aria-hidden={!isOpen}
        className={`fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-black bg-opacity-50 ${
          isOpen ? "" : "hidden"
        }`}
      >
        <div className="relative p-4 w-full max-w-md max-h-full overflow-y-auto">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create New Product
              </h3>
              <button
                onClick={toggleModal}
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
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
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="text-red-600 ml-4">
              {msg.map((message, index) => {
                return (
                  <ul key={index + 1}>
                    <li>{message}</li>
                  </ul>
                );
              })}
            </div>
            {/* Modal body */}
            <form className="p-4 md:p-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 mb-4 grid-cols-2">
                {/* Name */}
                <div className="col-span-2">
                  <label
                    for="name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="Type product name"
                    value={name}
                    onChange={handleChange}
                    required=""
                  />
                </div>
                {/* Price */}
                <div className="col-span-2">
                  <label
                    for="price"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    htmlFor="price"
                  >
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    value={price}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
                {/* Upload Image */}
                <div className="col-span-2">
                  <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Image
                  </label>
                  <div className="control">
                    <div className="file">
                      <label htmlFor="file-input" className="file-label">
                        <input
                          type="file"
                          className="file-input"
                          id="file-input"
                          name="file-input"
                          onChange={loadImage}
                        />
                        <span className="file-cta">
                          <span className="file-label">Choose a file...</span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                {preview ? (
                  <div className="col-span-2">
                    <img
                      src={preview}
                      alt="preview"
                      className="w-40 h-40"
                    ></img>
                  </div>
                ) : (
                  ""
                )}
                {/* Description */}
                <div className="col-span-2">
                  <label
                    for="description"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    htmlFor="description"
                  >
                    Product Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={description}
                    onChange={handleChange}
                    placeholder="Write product description here"
                  ></textarea>
                </div>
              </div>
              <button
                type="submit"
                class="text-white w-full justify-center text-center inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                <svg
                  class="me-1 -ms-1 w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                Add new product
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* {!alert && (
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          transition:Bounce
        />
      )} */}
    </>
  );
}

export default AddProductModal;
