import CompanyClient from './company-client';

export default function CompanyPage() {
  return <CompanyClient lanModeEnabled={process.env.LAN_MODE === 'true'} />;
}
