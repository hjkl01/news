/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  compress: true,
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/{{member}}',
    },
  },
};

export default nextConfig;
