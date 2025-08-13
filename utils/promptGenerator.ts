// utils/promptGenerator.ts

interface DesignParameters {
  prompt: string;
  style: string;
  roomType: string;
  temperature: string; // Тип дизайна
  budget: number;
  link?: string;
}

interface BudgetContext {
  description: string;
  materials: string[];
  furnitureLevel: string;
  lighting: string;
  decor: string;
}

/**
 * Получает контекст бюджета для генерации промпта
 */
export const getBudgetContext = (budget: number): BudgetContext => {
  if (budget < 1000) {
    return {
      description: "Максимальная экономия, минимальные вложения",
      materials: ["простая покраска стен", "недорогие обои", "ламинат", "простая плитка"],
      furnitureLevel: "1-2 базовых предмета мебели (IKEA, подержанные)",
      lighting: "простой светильник, основное освещение",
      decor: "минимум декора, несколько недорогих аксессуаров"
    };
  } else if (budget >= 1000 && budget <= 7000) {
    return {
      description: "Хороший функциональный дизайн среднего класса",
      materials: ["качественная краска", "акцентные обои", "хороший ламинат", "керамическая плитка"],
      furnitureLevel: "полный набор мебели из среднего ценового сегмента",
      lighting: "хорошее базовое освещение, несколько источников света",
      decor: "ковер, шторы, картины, декоративные элементы"
    };
  } else if (budget > 7000 && budget <= 20000) {
    return {
      description: "Премиум-дизайн с качественными материалами",
      materials: ["паркетная доска", "дизайнерские обои", "элементы из натурального камня", "качественная плитка"],
      furnitureLevel: "мебель от известных брендов среднего и высокого сегмента",
      lighting: "дизайнерское освещение, многоуровневые системы",
      decor: "качественный текстиль, предметы искусства, дизайнерские аксессуары"
    };
  } else {
    return {
      description: "Роскошный (Luxury) дизайн без ограничений",
      materials: ["мрамор", "натуральное дерево", "латунь", "эксклюзивные материалы"],
      furnitureLevel: "иконы дизайна, мебель на заказ, премиальные бренды",
      lighting: "сложные многоуровневые системы освещения, smart home",
      decor: "кастомные столярные изделия, произведения искусства, эксклюзивные предметы"
    };
  }
};

/**
 * Маппинг стилей на детальные описания
 */
const getStyleDescription = (style: string): string => {
  const styleMap: { [key: string]: string } = {
    'modern': 'Contemporary modern style with clean geometric lines, minimal clutter, neutral color palette (whites, grays, blacks), sleek furniture with metal and glass accents, open floor plan feel',
    'minimalist': 'Minimalist design philosophy with essential furniture only, maximum white space, functional beauty, hidden storage solutions, monochromatic color scheme',
    'classic': 'Timeless classic style with traditional furniture pieces, rich textures (velvet, silk, leather), warm wood tones, ornate details, symmetric arrangements',
    'loft': 'Industrial loft aesthetic with exposed brick walls, steel beams, raw materials, urban atmosphere, high ceilings, large windows, concrete floors',
    'scandinavian': 'Scandinavian hygge design with light woods (pine, birch), cozy textiles, neutral colors with pops of pastels, functional furniture, natural light emphasis'
  };
  
  return styleMap[style.toLowerCase()] || `${style} interior design style`;
};

/**
 * Маппинг типов комнат на функциональные требования
 */
const getRoomFunctionality = (roomType: string): string => {
  const roomMap: { [key: string]: string } = {
    'living-room': 'comfortable seating arrangement, entertainment center, coffee table, storage solutions, good lighting for reading and socializing',
    'bedroom': 'comfortable bed as focal point, nightstands, storage (wardrobe/dresser), reading area, relaxing atmosphere',
    'kitchen': 'functional work triangle, modern appliances, storage cabinets, countertop workspace, dining area if space allows',
    'bathroom': 'functional layout with sink, toilet, shower/bath, storage, good lighting, ventilation',
    'office': 'ergonomic desk setup, comfortable chair, storage for documents, good task lighting, minimal distractions'
  };
  
  return roomMap[roomType] || `functional ${roomType} layout`;
};

/**
 * Определение типа визуализации (подробная версия)
 */
const getVisualizationType = (temperature: string): string => {
  const typeMap: { [key: string]: string } = {
    'SketchUp': 'photorealistic render in SketchUp style with characteristic clean lines, precise geometry, and realistic textures but with slightly stylized appearance',
    '3D': 'photorealistic 3D architectural visualization with perfect lighting, shadows, and materials',
    'Rooming': 'detailed room planning visualization with accurate proportions and spatial relationships'
  };
  
  return typeMap[temperature] || 'photorealistic interior visualization';
};

/**
 * Краткое определение типа визуализации для коротких промптов
 */
const getShortVisualizationType = (temperature: string): string => {
  const typeMap: { [key: string]: string } = {
    'SketchUp': 'Photorealistic SketchUp-style render of',
    '3D': 'Photorealistic 3D render of',
    'Rooming': 'Interior design visualization of'
  };
  
  return typeMap[temperature] || 'Photorealistic render of';
};

/**
 * Получает краткое описание уровня бюджета
 */
const getBudgetLevel = (budget: number): string => {
  if (budget < 1000) return 'basic';
  if (budget <= 7000) return 'mid-range';
  if (budget <= 20000) return 'premium';
  return 'luxury';
};

/**
 * Генерирует оптимизированный промпт для AI (краткая версия)
 */
export const generateOptimizedPrompt = (params: DesignParameters): string => {
  const {
    prompt,
    style = 'modern',
    roomType = 'living-room',
    temperature = 'SketchUp',
    budget = 5000,
    link
  } = params;

  const budgetLevel = getBudgetLevel(budget);
  const visualType = getShortVisualizationType(temperature);
  
  // Формируем краткий, но информативный промпт
  let optimizedPrompt = `${visualType} ${roomType.replace('-', ' ')} in ${style} style. ${prompt}. Budget: $${budget} (${budgetLevel}). Professional quality, realistic lighting, clean composition.`;

  // Добавляем референс если есть
  if (link && link.trim()) {
    optimizedPrompt += ` Reference: ${link}`;
  }

  return optimizedPrompt;
};

/**
 * Генерирует подробный промпт для сложных случаев (альтернатива)
 */
export const generateDetailedPrompt = (params: DesignParameters): string => {
  const {
    prompt,
    style = 'modern',
    roomType = 'living-room',
    temperature = 'SketchUp',
    budget = 5000,
    link
  } = params;

  const budgetContext = getBudgetContext(budget);
  const styleDescription = getStyleDescription(style);
  const visualizationType = getVisualizationType(temperature);

  // Более короткая версия подробного промпта
  let detailedPrompt = `${visualizationType} of ${roomType.replace('-', ' ')} interior. ${styleDescription}. User request: "${prompt}". Budget $${budget}: ${budgetContext.description}. ${budgetContext.furnitureLevel}. Professional quality, realistic lighting.`;

  if (link && link.trim()) {
    detailedPrompt += ` Reference: ${link}`;
  }

  return detailedPrompt;
};

/**
 * Создает дополнительные инструкции для конкретного бюджета
 */
export const getBudgetSpecificInstructions = (budget: number): string => {
  if (budget < 1000) {
    return "Focus on one or two key improvements only. Show a very modest, clean room with basic furniture. No luxury items or expensive materials.";
  } else if (budget >= 1000 && budget <= 7000) {
    return "Show a complete, stylish room with mid-range furniture and good quality finishes. Avoid high-end designer pieces.";
  } else if (budget > 7000 && budget <= 20000) {
    return "Include premium materials and branded furniture. Show sophisticated lighting and high-quality finishes.";
  } else {
    return "No budget constraints. Include luxury materials, designer furniture, and premium finishes. Show the highest quality interior design.";
  }
}; 