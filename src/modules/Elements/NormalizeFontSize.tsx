export default function NormalizeFontSize({ size = 16 }) {
  return (
    <style>
      {`html {
                font-size: ${size}px !important;
            }`}
    </style>
  );
}
