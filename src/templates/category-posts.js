import * as React from "react";
import { Link, graphql } from "gatsby";

import Bio from "../components/bio";
import Layout from "../components/layout";
import Seo from "../components/seo";
import Categories from "../components/categories";
import Pagination from "../components/pagination";

const CategoryPostsTemplate = ({ data, location, pageContext }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`;
  const categories = data.categoryList.categories;
  const posts = data.categoryPosts.nodes;

  const { category } = pageContext;

  return (
    <Layout location={location} title={siteTitle}>
      <Seo title={`Posts in ${category}`} /> {/* 페이지 title 수정 */}
      <Bio />
      <Categories categories={categories} current={category} />
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
      <Pagination path={`/${category}`} pageContext={pageContext} />
    </Layout>
  );
};

export default CategoryPostsTemplate;

export const pageQuery = graphql`
  query ($category: String!, $skip: Int!, $limit: Int!) {
    site {
      siteMetadata {
        title
      }
    }
    categoryList: allMarkdownRemark {
      categories: distinct(field: frontmatter___category)
    }
    categoryPosts: allMarkdownRemark(
      sort: {
        fields: [frontmatter___date, frontmatter___title]
        order: [DESC, DESC]
      }
      filter: { frontmatter: { category: { eq: $category } } }
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
