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
 * Определение типа визуализации
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
 * Генерирует оптимизированный промпт для AI
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

  const budgetContext = getBudgetContext(budget);
  const styleDescription = getStyleDescription(style);
  const roomFunctionality = getRoomFunctionality(roomType);
  const visualizationType = getVisualizationType(temperature);

  // Формируем структурированный промпт
  let optimizedPrompt = `Create a ${visualizationType} of a ${roomType.replace('-', ' ')} interior design.

STYLE: ${styleDescription}

USER REQUEST: "${prompt}"

BUDGET CONSTRAINT ($${budget}): ${budgetContext.description}
- Materials: ${budgetContext.materials.join(', ')}
- Furniture level: ${budgetContext.furnitureLevel}
- Lighting: ${budgetContext.lighting}
- Decor: ${budgetContext.decor}

FUNCTIONAL REQUIREMENTS: ${roomFunctionality}

VISUAL QUALITY REQUIREMENTS:
- Photorealistic rendering with accurate lighting and shadows
- Professional interior photography composition
- Proper scale and proportions
- Realistic material textures and finishes
- Warm, inviting atmosphere
- Clean, uncluttered composition

TECHNICAL SPECIFICATIONS:
- High resolution, professional quality
- Proper perspective and depth of field
- Realistic color grading and contrast
- Sharp focus on key design elements
- Natural lighting setup

BUDGET COMPLIANCE:
- All furniture and materials must be appropriate for $${budget} budget
- Avoid items that exceed the budget range
- Focus on achievable, realistic design solutions
- Maintain professional look within budget constraints`;

  // Добавляем референсную ссылку если есть
  if (link && link.trim()) {
    optimizedPrompt += `\n\nREFERENCE INSPIRATION: ${link}`;
  }

  return optimizedPrompt;
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