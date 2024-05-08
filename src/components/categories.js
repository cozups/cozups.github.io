import * as React from "react";
import { Link } from "gatsby";

const Categories = ({ categories }) => {
  return (
    <nav>
      <ul className="list-none flex gap-2">
        {categories.map(category => (
          <li key={category}>
            <Link
              to={`/${category}`}
              className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-sm"
            >
              {category}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Categories;
