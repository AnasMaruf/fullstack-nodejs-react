import Navbar from "./Navbar";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import AuthApi from "../../api/AuthApi";
import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import DeleteProductModal from "./DeleteProductModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";

function Dashboard() {
  const [name, setName] = useState("");
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [alert, setAlert] = useState(false);
  const navigate = useNavigate();

  //PAGINATE
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    refreshToken();
    fetchData();
  }, [page, keyword]);

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
    const response = await axiosJWT.get(
      `http://localhost:3000/api/products?search_query=${keyword}&page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setProducts(response.data.result);
    setPage(response.data.page);
    setPages(response.data.totalPage);
    setRows(response.data.totalRows);
  };

  const handleUpdate = async (id, data) => {
    const updatedProduct = products.map((product) => {
      if (product.id === id) {
        return { ...product, ...data };
      }
    });
    setProducts(updatedProduct);
  };

  const changePage = ({ selected }) => {
    setPage(selected);
    if (selected === 9) {
      setMsg(
        "Jika tidak menemukan data yang anda cari, silahkan cari data dengan kata kunci spesifik"
      );
    } else {
      setMsg("");
    }
  };

  const searchData = (e) => {
    e.preventDefault();
    setPage(0);
    setKeyword(query);
  };

  return (
    <>
      <Navbar />
      <div className="mx-14 mt-4">
        <div className="relative overflow-x-auto mt-8">
          <h1>Hello, ${name}</h1>

          <AddProductModal
            fetch={fetchData}
            onProductAdded={() => setAlert(true)}
          />
          <form action="" onSubmit={searchData}>
            <div className="field has-addons">
              <div className="control is-expanded">
                <input
                  type="text"
                  className="input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find something here..."
                />
              </div>
              <div className="control">
                <button type="submit" className="button is-info">
                  Search
                </button>
              </div>
            </div>
          </form>
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 mt-5">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  No
                </th>
                <th scope="col" className="px-6 py-3">
                  Product Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Price
                </th>
                <th scope="col" className="px-6 py-3">
                  Image
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                return (
                  <tr
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                    key={product.id}
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {index + 1}
                    </th>
                    <td className="px-6 py-4">{product.name}</td>
                    <td className="px-6 py-4">{product.price}</td>
                    <td className="px-6 py-4">
                      <img
                        src={`http://localhost:3000/images/${product.image_path}`}
                        alt="image"
                        className="w-28 h-28"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <EditProductModal
                        product={product}
                        productId={product.id}
                        fetch={fetchData}
                        onUpdate={handleUpdate}
                      />
                      <DeleteProductModal
                        productId={product.id}
                        fetch={fetchData}
                        refresh={refreshToken}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p>
            Total Rows: {rows} Page: {rows ? page + 1 : 0} of {pages}
          </p>
          <p className="has-text-centered has-text-danger">{msg}</p>
        </div>
      </div>
      <nav
        className="pagination is-centered"
        key={rows}
        role="navigation"
        aria-label="pagination"
      >
        <ReactPaginate
          previousLabel={"< prev"}
          nextLabel={"Next >"}
          pageCount={Math.min(10, pages)}
          onPageChange={changePage}
          containerClassName={"pagination-list"}
          pageLinkClassName={"pagination-link"}
          previousLinkClassName={"pagination-previous"}
          nextLinkClassName={"pagination-next"}
          activeLinkClassName={"pagination-link is-current"}
          disabledLinkClassName={"pagination-link is-disabled"}
        />
      </nav>
      {!alert && (
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
      )}
    </>
  );
}

export default Dashboard;
