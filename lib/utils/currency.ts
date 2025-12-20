/**
 * Format a number as Indonesian Rupiah currency
 * @param value - The numeric value to format
 * @returns Formatted currency string (e.g., "Rp 1.234.567")
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

/**
 * Format a compact currency value (e.g., "Rp 1.2M")
 * @param value - The numeric value to format
 * @returns Compact formatted currency string
 */
export const formatCurrencyCompact = (value: number): string => {
    if (value >= 1000000000) {
        return `Rp ${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
        return `Rp ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `Rp ${(value / 1000).toFixed(1)}K`;
    }
    return formatCurrency(value);
};
