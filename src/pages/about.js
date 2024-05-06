import { Link } from "gatsby";
import React from "react";

const AboutPage = () => {
  return (
    <main>
      <Link to="/">Home</Link>
      <h1>김미소 Miso Kim</h1>
      <p>안녕하세요. 프론트엔드 개발자가 되고 싶은 김미소입니다.</p>
    </main>
  );
};

export const Head = () => <title>About me</title>;

export default AboutPage;
