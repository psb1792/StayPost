/**
 * Generates natural language lighting prompts for image relighting
 * based on image metadata analysis
 */

export interface ImageMetadata {
  main_features: string[];
  view_type: string;
  emotions: string[];
}

export interface LightingPrompt {
  prompt: string;
  category: string;
  intensity: 'subtle' | 'moderate' | 'dramatic';
  description: string;
}

// 🎨 Lighting pattern definitions based on content analysis
const lightingPatterns = {
  // Ocean/Water scenes
  ocean_sunset: {
    conditions: (meta: ImageMetadata) => 
      meta.view_type.includes('오션') || 
      meta.main_features.some(f => f.includes('바다') || f.includes('노을')),
    prompts: [
      {
        prompt: 'warm golden hour lighting with soft orange and pink reflections on water',
        category: 'Ocean Sunset',
        intensity: 'moderate' as const,
        description: 'Creates a romantic sunset atmosphere over water'
      },
      {
        prompt: 'dramatic sunset lighting with deep orange sky and shimmering water reflections',
        category: 'Ocean Sunset',
        intensity: 'dramatic' as const,
        description: 'Enhances the dramatic beauty of ocean sunsets'
      },
      {
        prompt: 'soft morning light with gentle blue and gold tones reflecting off calm water',
        category: 'Ocean Morning',
        intensity: 'subtle' as const,
        description: 'Peaceful morning ocean atmosphere'
      }
    ]
  },

  // Pool/Swimming areas
  pool_luxury: {
    conditions: (meta: ImageMetadata) => 
      meta.main_features.some(f => f.includes('수영장') || f.includes('풀')) ||
      meta.emotions.some(e => e.includes('럭셔리')),
    prompts: [
      {
        prompt: 'bright azure pool lighting with crystal clear water reflections and warm ambient glow',
        category: 'Luxury Pool',
        intensity: 'moderate' as const,
        description: 'Enhances the luxury feel of pool areas'
      },
      {
        prompt: 'underwater LED lighting with turquoise glow and sparkling water surface',
        category: 'Pool Night',
        intensity: 'dramatic' as const,
        description: 'Creates stunning nighttime pool ambiance'
      },
      {
        prompt: 'natural daylight with bright, clean pool water and soft shadows',
        category: 'Pool Day',
        intensity: 'subtle' as const,
        description: 'Fresh, inviting daytime pool atmosphere'
      }
    ]
  },

  // Garden/Nature scenes
  garden_nature: {
    conditions: (meta: ImageMetadata) => 
      meta.main_features.some(f => f.includes('정원') || f.includes('산') || f.includes('숲')) ||
      meta.view_type.includes('가든') || meta.view_type.includes('마운틴'),
    prompts: [
      {
        prompt: 'dappled sunlight filtering through leaves with warm green tones and soft shadows',
        category: 'Garden Light',
        intensity: 'subtle' as const,
        description: 'Natural, peaceful garden lighting'
      },
      {
        prompt: 'golden hour lighting with warm rays illuminating lush greenery and flowers',
        category: 'Garden Sunset',
        intensity: 'moderate' as const,
        description: 'Magical garden atmosphere during golden hour'
      },
      {
        prompt: 'misty morning light with soft diffused glow through trees and plants',
        category: 'Garden Morning',
        intensity: 'subtle' as const,
        description: 'Serene morning garden ambiance'
      }
    ]
  },

  // Romantic/Couple settings
  romantic_mood: {
    conditions: (meta: ImageMetadata) => 
      meta.emotions.some(e => e.includes('로맨틱')) ||
      meta.main_features.some(f => f.includes('자쿠지') || f.includes('테라스')),
    prompts: [
      {
        prompt: 'warm candlelight ambiance with soft golden glow and intimate shadows',
        category: 'Romantic Evening',
        intensity: 'moderate' as const,
        description: 'Creates intimate, romantic atmosphere'
      },
      {
        prompt: 'sunset lighting with warm pink and orange hues creating romantic silhouettes',
        category: 'Romantic Sunset',
        intensity: 'dramatic' as const,
        description: 'Perfect for romantic moments'
      },
      {
        prompt: 'soft fairy lights with warm white glow and dreamy bokeh effects',
        category: 'Romantic Lights',
        intensity: 'subtle' as const,
        description: 'Enchanting evening romance'
      }
    ]
  },

  // Modern/Architectural spaces
  modern_architecture: {
    conditions: (meta: ImageMetadata) => 
      meta.emotions.some(e => e.includes('모던')) ||
      meta.main_features.some(f => f.includes('모던') || f.includes('건축')),
    prompts: [
      {
        prompt: 'clean architectural lighting with sharp shadows and bright white illumination',
        category: 'Modern Clean',
        intensity: 'moderate' as const,
        description: 'Emphasizes modern design elements'
      },
      {
        prompt: 'dramatic uplighting with bold contrasts highlighting architectural features',
        category: 'Architectural Drama',
        intensity: 'dramatic' as const,
        description: 'Showcases architectural beauty'
      },
      {
        prompt: 'minimalist lighting with soft even illumination and subtle shadows',
        category: 'Minimalist',
        intensity: 'subtle' as const,
        description: 'Clean, contemporary feel'
      }
    ]
  },

  // Family/Kids areas
  family_friendly: {
    conditions: (meta: ImageMetadata) => 
      meta.main_features.some(f => f.includes('키즈') || f.includes('놀이')) ||
      meta.emotions.some(e => e.includes('가족')),
    prompts: [
      {
        prompt: 'bright cheerful lighting with vibrant colors and playful atmosphere',
        category: 'Family Fun',
        intensity: 'moderate' as const,
        description: 'Creates joyful family atmosphere'
      },
      {
        prompt: 'warm afternoon sunlight with soft shadows perfect for family activities',
        category: 'Family Day',
        intensity: 'subtle' as const,
        description: 'Comfortable family environment'
      },
      {
        prompt: 'colorful party lighting with festive glow and happy ambiance',
        category: 'Family Celebration',
        intensity: 'dramatic' as const,
        description: 'Festive family gathering mood'
      }
    ]
  },

  // Healing/Relaxation spaces
  healing_spa: {
    conditions: (meta: ImageMetadata) => 
      meta.emotions.some(e => e.includes('힐링') || e.includes('고요')),
    prompts: [
      {
        prompt: 'soft spa lighting with gentle blue and white tones for ultimate relaxation',
        category: 'Spa Relaxation',
        intensity: 'subtle' as const,
        description: 'Calming, therapeutic atmosphere'
      },
      {
        prompt: 'zen lighting with warm earth tones and peaceful shadows',
        category: 'Zen Healing',
        intensity: 'subtle' as const,
        description: 'Meditative, healing environment'
      },
      {
        prompt: 'natural wellness lighting with soft green and blue hues',
        category: 'Natural Healing',
        intensity: 'moderate' as const,
        description: 'Nature-inspired wellness mood'
      }
    ]
  }
};

// 🌅 Time-based lighting suggestions
const timeBasedLighting = {
  morning: [
    'soft morning light with gentle golden rays and fresh atmosphere',
    'bright daybreak lighting with cool blue and warm yellow tones',
    'misty morning glow with diffused sunlight and peaceful ambiance'
  ],
  afternoon: [
    'bright natural daylight with clear shadows and vibrant colors',
    'warm afternoon sun with comfortable lighting and natural shadows',
    'clear midday lighting with bright illumination and crisp details'
  ],
  evening: [
    'golden hour lighting with warm orange and pink sunset glow',
    'dramatic evening light with long shadows and rich colors',
    'twilight ambiance with soft purple and blue evening tones'
  ],
  night: [
    'warm interior lighting with cozy amber glow and intimate atmosphere',
    'dramatic night lighting with strategic spotlights and mood shadows',
    'soft evening ambiance with gentle warm lights and relaxing mood'
  ]
};

// 🎯 Fallback prompts for different scenarios
const fallbackPrompts = {
  general: [
    {
      prompt: 'warm natural lighting with soft shadows and comfortable ambiance',
      category: 'Natural Comfort',
      intensity: 'moderate' as const,
      description: 'Versatile, appealing lighting for any space'
    },
    {
      prompt: 'bright cheerful lighting with even illumination and welcoming atmosphere',
      category: 'Bright Welcome',
      intensity: 'moderate' as const,
      description: 'Inviting, positive lighting'
    },
    {
      prompt: 'golden hour glow with warm tones and beautiful natural light',
      category: 'Golden Hour',
      intensity: 'moderate' as const,
      description: 'Universally flattering lighting'
    }
  ],
  luxury: [
    {
      prompt: 'sophisticated lighting with elegant shadows and premium ambiance',
      category: 'Luxury Elegance',
      intensity: 'dramatic' as const,
      description: 'High-end, sophisticated atmosphere'
    },
    {
      prompt: 'warm luxury lighting with rich golden tones and refined atmosphere',
      category: 'Luxury Warmth',
      intensity: 'moderate' as const,
      description: 'Luxurious yet comfortable feel'
    }
  ],
  cozy: [
    {
      prompt: 'cozy warm lighting with soft amber glow and intimate atmosphere',
      category: 'Cozy Comfort',
      intensity: 'subtle' as const,
      description: 'Comfortable, homey feeling'
    },
    {
      prompt: 'fireplace-like warm lighting with gentle orange glow and relaxing mood',
      category: 'Cozy Fire',
      intensity: 'moderate' as const,
      description: 'Warm, inviting atmosphere'
    }
  ]
};

/**
 * Generates a lighting prompt based on image metadata
 */
export function generateRetouchPrompt(metadata: ImageMetadata): LightingPrompt {
  // Input validation
  if (!metadata || !metadata.main_features || !metadata.view_type || !metadata.emotions) {
    console.warn('Invalid metadata provided, using fallback prompt');
    return fallbackPrompts.general[0];
  }

  try {
    // Find matching pattern
    for (const [patternKey, pattern] of Object.entries(lightingPatterns)) {
      if (pattern.conditions(metadata)) {
        // Select best prompt from pattern
        const prompts = pattern.prompts;
        
        // Prefer moderate intensity, then subtle, then dramatic
        const preferredPrompt = 
          prompts.find(p => p.intensity === 'moderate') ||
          prompts.find(p => p.intensity === 'subtle') ||
          prompts[0];
        
        console.log(`Selected lighting pattern: ${patternKey}`);
        return preferredPrompt;
      }
    }

    // No specific pattern matched, use emotion-based fallback
    if (metadata.emotions.some(e => e.includes('럭셔리'))) {
      return fallbackPrompts.luxury[0];
    }
    
    if (metadata.emotions.some(e => e.includes('아늑') || e.includes('고요'))) {
      return fallbackPrompts.cozy[0];
    }

    // Default fallback
    return fallbackPrompts.general[0];

  } catch (error) {
    console.error('Error generating retouch prompt:', error);
    return fallbackPrompts.general[0];
  }
}

/**
 * Generates multiple prompt options for user selection
 */
export function generateMultiplePrompts(metadata: ImageMetadata, count: number = 3): LightingPrompt[] {
  const prompts: LightingPrompt[] = [];
  
  try {
    // Find all matching patterns
    const matchingPatterns = Object.entries(lightingPatterns)
      .filter(([_, pattern]) => pattern.conditions(metadata));

    // Collect prompts from matching patterns
    for (const [_, pattern] of matchingPatterns) {
      prompts.push(...pattern.prompts);
    }

    // Add fallback prompts if needed
    if (prompts.length < count) {
      prompts.push(...fallbackPrompts.general);
      
      if (metadata.emotions.some(e => e.includes('럭셔리'))) {
        prompts.push(...fallbackPrompts.luxury);
      }
      
      if (metadata.emotions.some(e => e.includes('아늑'))) {
        prompts.push(...fallbackPrompts.cozy);
      }
    }

    // Remove duplicates and limit to requested count
    const uniquePrompts = prompts.filter((prompt, index, self) => 
      index === self.findIndex(p => p.prompt === prompt.prompt)
    );

    return uniquePrompts.slice(0, count);

  } catch (error) {
    console.error('Error generating multiple prompts:', error);
    return fallbackPrompts.general.slice(0, count);
  }
}

/**
 * Gets time-based lighting suggestion
 */
export function getTimeBasedPrompt(timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'): string {
  const prompts = timeBasedLighting[timeOfDay];
  return prompts[Math.floor(Math.random() * prompts.length)];
}

/**
 * Analyzes metadata and suggests the best lighting approach
 */
export function analyzeLightingNeeds(metadata: ImageMetadata): {
  primaryPrompt: LightingPrompt;
  alternatives: LightingPrompt[];
  recommendations: string[];
} {
  const primaryPrompt = generateRetouchPrompt(metadata);
  const alternatives = generateMultiplePrompts(metadata, 3)
    .filter(p => p.prompt !== primaryPrompt.prompt);

  const recommendations: string[] = [];

  // Generate contextual recommendations
  if (metadata.view_type.includes('오션')) {
    recommendations.push('Consider sunset or sunrise lighting for dramatic ocean views');
  }
  
  if (metadata.main_features.some(f => f.includes('수영장'))) {
    recommendations.push('Pool areas benefit from bright, clear lighting or underwater effects');
  }
  
  if (metadata.emotions.some(e => e.includes('로맨틱'))) {
    recommendations.push('Warm, soft lighting enhances romantic atmosphere');
  }
  
  if (metadata.emotions.some(e => e.includes('모던'))) {
    recommendations.push('Clean, architectural lighting complements modern design');
  }

  // Add general recommendations if none specific
  if (recommendations.length === 0) {
    recommendations.push('Golden hour lighting works well for most accommodation photos');
    recommendations.push('Warm, natural lighting creates an inviting atmosphere');
  }

  return {
    primaryPrompt,
    alternatives,
    recommendations
  };
}

// Export types and utility functions
export type { LightingPrompt };
export { lightingPatterns, timeBasedLighting, fallbackPrompts };