import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import ProductList from './components/ProductList';
import SearchBar from './components/SearchBar';
import Cart from './components/Cart';

function App() {
  return (
    <Router>
      <div className="container mx-auto p-4">
        <nav className="bg-gray-800 text-white p-4">
          <ul className="flex space-x-4">
            <li><Link to="/products" className="hover:underline">Products</Link></li>
            <li><Link to="/search" className="hover:underline">Search</Link></li>
            <li><Link to="/cart" className="hover:underline">Cart</Link></li>
          </ul>
        </nav>
        <Switch>
          <Route path="/products" component={ProductList} />
          <Route path="/search" component={SearchBar} />
          <Route path="/cart" component={Cart} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
