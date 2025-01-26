export const FILTER_TYPES = {
  EXACT: 'exact',    
  RANGE: 'range',    
  OPTION: 'option',  
  DISABLED: 'disabled'
} as const;

export const RANGE_TYPES = {
  MIN_ONLY: 'min_only',     
  MAX_ONLY: 'max_only',     
  MIN_MAX: 'min_max',       
  EXACT: 'exact'            
} as const;

export const FILTER_CONFIG = {
  // ... copy the filter config from search.js
} as const; 