import Image from 'next/image';

interface StatCardProps {
  title: string;
  value: string | number;
  iconSrc: string;
  iconAlt: string;
  iconBgColor?: string;
}

export function StatCard({ title, value, iconSrc, iconAlt, iconBgColor = 'bg-blue-100' }: StatCardProps) {
  return (
    <div className="bg-white rounded-md px-6 h-32 lg:h-[138px] border border-gray-200">
      <div className="flex items-center px-3 h-full">
        <div className={`p-3 ${iconBgColor} rounded-sm`}>
          <Image src={iconSrc} alt={iconAlt} width={40} height={40} className="lg:h-9 lg:w-9 h-8 w-8" />
        </div>
        <div className="ml-6">
          <p className="text-md text-gray-600 mb-3">{title}</p>
          <p className="text-4xl font-bold text-primary">{value}</p>
        </div>
      </div>
    </div>
  );
}
