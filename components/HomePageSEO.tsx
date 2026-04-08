import React from 'react';
import SEO from './SEO';

const HomePageSEO: React.FC = () => {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PerformOS',
    description: 'PerformOS is a high-performance intelligence platform for behaviour analytics, coaching, and workforce wellbeing.',
    url: 'https://performos.zeabur.app',
    logo: 'https://performos.zeabur.app/logo.svg',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Sales'
    },
    sameAs: []
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PerformOS',
    url: 'https://performos.zeabur.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://performos.zeabur.app/blog?search={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://performos.zeabur.app'
      }
    ]
  };

  // Combine all schemas
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema, websiteSchema, breadcrumbSchema]
  };

  return (
    <SEO
      title="PerformOS | High-Performance Intelligence Platform"
      description="PerformOS is a high-performance intelligence platform for behaviour analytics, coaching, and workforce wellbeing."
      structuredData={structuredData}
    />
  );
};

export default HomePageSEO;
