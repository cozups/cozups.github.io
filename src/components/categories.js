import * as React from "react";
import { Link } from "gatsby";

const Categories = ({ categories, current = "" }) => {
  return (
    <nav>
      <ul className="list-none flex gap-2 flex-wrap">
        {categories.map(category => (
          <li key={category}>
            <Link
              to={`/${category}`}
              className={`category-item ${current === category && "active"}`}
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
