'use client';

interface VehicleInfoProps {
  vin: string;
  partName: string;
  partNumber: string;
  OEM: string;
  calibrationType?: string;
}

export function VehicleInfo({ vin, partName, partNumber, OEM, calibrationType }: VehicleInfoProps) {
  return (
    <div className="space-y-1 mb-0">
      <div>
        <span className="text-xl font-normal text-primary">{partName}</span>
      </div>
      <div>
        <span className="text-xl font-normal text-primary">{vin}</span>
      </div>

      <div className="space-y-1">
        <div className="space-x-1">
          <span className="text-base text-primary font-semibold">{partNumber}</span>
        </div>
        <div className="space-x-1">
          <span className="text-base text-primary font-semibold">{OEM}</span>
        </div>
        {calibrationType && (
          <div className="space-x-1">
            <span className="text-base text-primary font-semibold">Calibration Type:</span>
            <span className="text-base text-primary font-semibold">{calibrationType}</span>
          </div>
        )}
      </div>
    </div>
  );
}
