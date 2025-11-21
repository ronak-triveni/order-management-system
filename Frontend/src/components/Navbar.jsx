import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: 20, gap: 20, display: "flex" }}>
      <Link to="/orders">Orders</Link>
      <Link to="/order/create">Create Order</Link>
      <Link to="/customers">Customers</Link>
      <Link to="/products">Products</Link>
      <Link to="/search">Search</Link>
    </nav>
  );
}
