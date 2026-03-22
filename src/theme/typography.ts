export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
  // Semantic text variants
  variants: {
    heading1: { fontSize: 32, fontWeight: '700' as const },
    heading2: { fontSize: 24, fontWeight: '700' as const },
    heading3: { fontSize: 20, fontWeight: '600' as const },
    subheading: { fontSize: 18, fontWeight: '500' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    bodyMedium: { fontSize: 16, fontWeight: '500' as const },
    description: { fontSize: 14, fontWeight: '400' as const },
    caption: { fontSize: 12, fontWeight: '400' as const },
  },
};
