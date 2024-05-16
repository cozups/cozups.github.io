import React from "react";
import { Link } from "gatsby";

import { MdArrowForwardIos, MdArrowBackIosNew } from "react-icons/md";

const Pagination = ({ path = "", pageContext }) => {
  const prevPageDisabled = pageContext.currentPage === 1;
  const nextPageDisabled = pageContext.currentPage === pageContext.numPages;
  const pageNumberList = Array.from(
    { length: pageContext.numPages < 10 ? pageContext.numPages : 10 },
    (_, index) => Math.floor(pageContext.currentPage / 10) + index + 1
  );

  return (
    <div className="pagination">
      {
        <Link
          to={
            pageContext.currentPage === 2
              ? `${path}/`
              : `${path}/page/${pageContext.currentPage - 1}`
          }
          className="text-black"
        >
          {!prevPageDisabled ? <MdArrowBackIosNew /> : ""}
        </Link>
      }
      <ul className="list-none flex">
        {pageNumberList.map(pageNumber => (
          <li key={`page/${pageNumber}`}>
            <Link
              className={`pagination-item ${
                pageNumber === pageContext.currentPage && "page-activated"
              }`}
              to={pageNumber === 1 ? `${path}/` : `${path}/page/${pageNumber}`}
            >
              {pageNumber}
            </Link>
          </li>
        ))}
      </ul>
      {
        <Link
          to={`${path}/page/${pageContext.currentPage + 1}`}
          className="text-black"
        >
          {!nextPageDisabled ? <MdArrowForwardIos /> : ""}
        </Link>
      }
    </div>
  );
};

export default Pagination;
