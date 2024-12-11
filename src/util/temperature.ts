export const convertTemperature = (
  value: number,
  fromUnit: string,
  toUnit: string
) => {
  if (fromUnit === toUnit) return value;
  if (fromUnit === "Celsius" && toUnit === "Fahrenheit")
    return value * 1.8 + 32;
  if (fromUnit === "Celsius" && toUnit === "Kelvin") return value + 273.15;
  if (fromUnit === "Fahrenheit" && toUnit === "Celsius")
    return (value - 32) / 1.8;
  if (fromUnit === "Fahrenheit" && toUnit === "Kelvin")
    return (value - 32) / 1.8 + 273.15;
  if (fromUnit === "Kelvin" && toUnit === "Celsius") return value - 273.15;
  if (fromUnit === "Kelvin" && toUnit === "Fahrenheit")
    return (value - 273.15) * 1.8 + 32;
  return value;
};
