import React, { useState } from 'react';
import axios from 'axios';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    axios.get(`http://localhost:3000/api/v1/search?query=${query}`)
      .then(response => setResults(response.data))
      .catch(error => console.error('Error searching:', error));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Search</h2>
      <div className="flex mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="border p-2 flex-grow"
        />
        <button
          onClick={handleSearch}
          className="ml-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Search
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {results.map(product => (
          <div key={product.id} className="border p-4 rounded shadow">
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p>{product.description}</p>
            <p className="text-green-600">${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
