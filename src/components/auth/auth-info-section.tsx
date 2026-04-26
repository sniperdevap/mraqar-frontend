'use client';

interface AuthInfoSectionProps {
  title: string;
  subtitle?: string;
  description: string;
  features: string[];
  backgroundImage?: string;
  backgroundColor?: string;
}

export function AuthInfoSection({ title, subtitle, description, features, backgroundImage = '/images/auth/auth-bg.svg', backgroundColor = 'bg-blue-primary' }: AuthInfoSectionProps) {
  return (
    <div className={`hidden lg:flex lg:w-1/2 relative ${backgroundColor}`}>
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      />

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col justify-center lg:justify-start lg:mt-48 2xl:mt-20 3xl:mt-48 pe-12 lg:ps-10 xl:ps-24 w-full text-white">
        <h1 className="lg:text-4xl xl:text-5xl font-bold leading-tight">{title}</h1>
        {subtitle && <h1 className="lg:text-4xl xl:text-5xl font-bold mb-18 leading-tight">{subtitle}</h1>}

        <p className="text-xl font-semibold mb-8 text-white max-w-md text-wrap">{description}</p>

        <ul className="space-y-4 mt-12">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-transparent border-2 border-primary-blue-light flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-blue-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-lg font-semibold">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
