import * as React from "react";
import { Link, graphql } from "gatsby";

import Bio from "../components/bio";
import Layout from "../components/layout";
import Seo from "../components/seo";
import Categories from "../components/categories";

const BlogIndex = ({ data, location, pageContext }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`;
  const posts = data.allMarkdownRemark.nodes;
  const categories = data.categoryList.categories;

  console.log(pageContext);

  if (posts.length === 0) {
    return (
      <Layout location={location} title={siteTitle}>
        <Bio />
        <p>
          No blog posts found. Add markdown posts to "content/blog" (or the
          directory you specified for the "gatsby-source-filesystem" plugin in
          gatsby-config.js).
        </p>
      </Layout>
    );
  }

  const prevPageDisabled = pageContext.pageNumber === 0;
  const nextPageDisabled =
    pageContext.humanPageNumber === pageContext.numberOfPages;
  const pageNumberList = Array.from(
    { length: pageContext.numberOfPages < 10 ? pageContext.numberOfPages : 10 },
    (_, index) => Math.floor(pageContext.pageNumber / 10) + index + 1
  );

  return (
    <Layout location={location} title={siteTitle}>
      <Bio />
      <Categories categories={categories} />
      <ol style={{ listStyle: `none` }}>
        {posts.map(post => {
          const title = post.frontmatter.title || post.fields.slug;

          return (
            <li key={post.fields.slug} className="min-h-24">
              <article
                className="post-list-item"
                itemScope
                itemType="http://schema.org/Article"
              >
                <header>
                  <h2>
                    <Link to={post.fields.slug} itemProp="url">
                      <span
                        itemProp="headline"
                        className="text-black hover:text-blue-500 transition-colors ease-in duration-150"
                      >
                        {title}
                      </span>
                    </Link>
                  </h2>
                  <small>{post.frontmatter.date}</small>
                </header>
                <section>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: post.frontmatter.description || post.excerpt,
                    }}
                    itemProp="description"
                  />
                </section>
              </article>
            </li>
          );
        })}
      </ol>
      <div className="flex justify-center">
        {!prevPageDisabled && (
          <Link to={pageContext.previousPagePath} className="text-black">
            {"<"}
          </Link>
        )}
        <ul className="list-none flex">
          {pageNumberList.map(pageNumber => (
            <li>
              <Link
                className={`text-black border-black border-2 px-2 ${
                  pageNumber === pageContext.pageNumber + 1 && "page-activated"
                }`}
                to={pageNumber === 1 ? `/blog` : `/blog/${pageNumber}`}
              >
                {pageNumber}
              </Link>
            </li>
          ))}
        </ul>
        {!nextPageDisabled && (
          <Link to={pageContext.nextPagePath} className="text-black">
            {">"}
          </Link>
        )}
      </div>
    </Layout>
  );
};

export default BlogIndex;

/**
 * Head export to define metadata for the page
 *
 * See: https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/
 */
export const Head = () => <Seo title="All posts" />;

export const pageQuery = graphql`
  query ($skip: Int!, $limit: Int!) {
    site {
      siteMetadata {
        title
      }
    }
    categoryList: allMarkdownRemark {
      categories: distinct(field: frontmatter___category)
    }
    allMarkdownRemark(
      sort: {
        fields: [frontmatter___date, frontmatter___title]
        order: [DESC, DESC]
      }
      skip: $skip
      limit: $limit
    ) {
      nodes {
        id
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          description
        }
      }
    }
  }
`;
