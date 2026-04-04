import React from 'react';
import { Helmet } from 'react-helmet-async';

const SeoHelmet = ({ title, description, keywords, canonical, image }) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="keywords" content={keywords} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    {canonical ? <meta property="og:url" content={canonical} /> : null}
    {image ? <meta property="og:image" content={image} /> : null}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    {image ? <meta name="twitter:image" content={image} /> : null}
    {canonical ? <link rel="canonical" href={canonical} /> : null}
  </Helmet>
);

export default SeoHelmet;
