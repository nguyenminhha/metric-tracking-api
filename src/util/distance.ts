const distanceConversionRates: any = {
  Meter: 1,
  Centimeter: 100,
  Inch: 39.3701,
  Feet: 3.28084,
  Yard: 1.09361,
};

export const convertDistance = (
  value: number,
  fromUnit: string,
  toUnit: string
) => {
  return (
    (value * distanceConversionRates[toUnit]) /
    distanceConversionRates[fromUnit]
  );
};
