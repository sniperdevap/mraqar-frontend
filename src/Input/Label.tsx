import React from 'react';

interface LabelProps {
  label: string;
}

const Label: React.FC<LabelProps> = ({ label }) => {
  return <label className="input-label">{label}</label>;
};

export default Label;
