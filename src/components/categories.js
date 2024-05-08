import * as React from "react";
import { Link } from "gatsby";

const Categories = ({ categories }) => {
  return (
    <nav>
      <ul>
        {categories.map(category => (
          <li key={category}>
            <Link to={`/${category}`}>{category}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Categories;
