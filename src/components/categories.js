import * as React from "react";
import { Link } from "gatsby";

const Categories = ({ categories }) => {
  return (
    <nav>
      <ul className="list-none flex gap-2 flex-wrap">
        {categories.map(category => (
          <li key={category}>
            <Link
              to={`/${category}`}
              className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs md:text-sm"
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
