import React from 'react';
import './PriceRangeFilter.scss';

export interface PriceRange {
  min: number;
  max: number;
}

interface PriceRangeFilterProps {
  priceRange: PriceRange;
  onPriceRangeChange: (range: PriceRange) => void;
  className?: string;
}

const QUICK_PRICE_RANGES: Array<{ label: string; range: PriceRange }> = [
  { label: 'До 10 лв', range: { min: 0, max: 10 } },
  { label: '10-20 лв', range: { min: 10, max: 20 } },
  { label: '20-50 лв', range: { min: 20, max: 50 } },
  { label: 'Над 50 лв', range: { min: 50, max: 999 } },
];

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  priceRange,
  onPriceRangeChange,
  className = ''
}) => {
  const handleMinPriceChange = (value: number) => {
    const minPrice = Math.max(0, value);
    onPriceRangeChange({
      min: minPrice,
      max: Math.max(minPrice, priceRange.max)
    });
  };

  const handleMaxPriceChange = (value: number) => {
    const maxPrice = Math.max(0, value);
    onPriceRangeChange({
      min: Math.min(priceRange.min, maxPrice),
      max: maxPrice
    });
  };

  const handleQuickRangeClick = (range: PriceRange) => {
    onPriceRangeChange(range);
  };

  const isQuickRangeActive = (range: PriceRange) => {
    return priceRange.min === range.min && priceRange.max === range.max;
  };

  return (
    <div className={`price-range-filter ${className}`}>
      <div className="price-range-inputs">
        <div className="price-input-group">
          <label htmlFor="minPrice" className="sr-only">Минимална цена</label>
          <input
            id="minPrice"
            type="number"
            min="0"
            max="999"
            step="0.50"
            value={priceRange.min}
            onChange={(e) => handleMinPriceChange(parseFloat(e.target.value) || 0)}
            className="price-input"
            placeholder="От"
          />
          <span className="price-currency">лв</span>
        </div>
        
        <span className="price-separator">до</span>
        
        <div className="price-input-group">
          <label htmlFor="maxPrice" className="sr-only">Максимална цена</label>
          <input
            id="maxPrice"
            type="number"
            min="0"
            max="999"
            step="0.50"
            value={priceRange.max}
            onChange={(e) => handleMaxPriceChange(parseFloat(e.target.value) || 0)}
            className="price-input"
            placeholder="До"
          />
          <span className="price-currency">лв</span>
        </div>
      </div>
      
      <div className="price-range-display">
        <span className="price-range-text">
          {priceRange.min.toFixed(2)} лв - {priceRange.max.toFixed(2)} лв
        </span>
      </div>
      
      {/* Quick Price Ranges */}
      <div className="price-quick-filters">
        {QUICK_PRICE_RANGES.map((item, index) => (
          <button
            key={index}
            onClick={() => handleQuickRangeClick(item.range)}
            className={`price-quick-btn ${isQuickRangeActive(item.range) ? 'price-quick-btn--active' : ''}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PriceRangeFilter;